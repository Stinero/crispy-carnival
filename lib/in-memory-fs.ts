import { FileSystemNode } from "../types";
import type { Sandbox } from '@e2b/sdk';


export class InMemoryFileSystem {
    private files: Map<string, string>;
    private directories: Set<string>;

    constructor() {
        this.files = new Map();
        this.directories = new Set(['/']);
    }
    
    private getParentDir(path: string): string {
        const parts = path.split('/').filter(p => p);
        if (parts.length <= 1) return '/';
        return '/' + parts.slice(0, -1).join('/');
    }

    private ensureDirectoryExists(path: string) {
        if (path === '/') return;
        const parts = path.split('/').filter(p => p);
        let currentPath = '';
        for (const part of parts) {
            currentPath += `/${part}`;
            if (!this.directories.has(currentPath)) {
                this.directories.add(currentPath);
            }
        }
    }

    public writeFile(path: string, content: string): void {
        const parentDir = this.getParentDir(path);
        this.ensureDirectoryExists(parentDir);
        this.files.set(path, content);
    }

    public readFile(path: string): string {
        if (!this.files.has(path)) {
            throw new Error(`File not found in memory cache: ${path}`);
        }
        return this.files.get(path)!;
    }

    public listFiles(path: string): { name: string, isDir: boolean }[] {
        if (!this.directories.has(path)) {
             throw new Error(`Directory not found in memory cache: ${path}`);
        }
        
        const results = new Map<string, { name: string, isDir: boolean }>();
        const pathPrefix = path === '/' ? '/' : `${path}/`;

        for (const p of this.files.keys()) {
            if (p.startsWith(pathPrefix) && this.getParentDir(p) === path) {
                const name = p.substring(pathPrefix.length-1);
                results.set(name, { name: name.replace('/', ''), isDir: false });
            }
        }
        
        for (const p of this.directories.keys()) {
            if (p.startsWith(pathPrefix) && p !== path && this.getParentDir(p) === path) {
                const name = p.substring(pathPrefix.length-1);
                results.set(name, { name: name.replace('/', ''), isDir: true });
            }
        }
        return Array.from(results.values());
    }

    public createDirectory(path: string): void {
        this.ensureDirectoryExists(path);
    }
    
    public moveFile(source: string, destination: string): void {
        if (!this.files.has(source)) {
            throw new Error(`Source file not found in memory cache: ${source}`);
        }
        const content = this.files.get(source)!;
        const destParentDir = this.getParentDir(destination);
        this.ensureDirectoryExists(destParentDir);
        this.files.set(destination, content);
        this.files.delete(source);
    }

    public delete(path: string): void {
        if (this.files.has(path)) {
            this.files.delete(path);
        } else if (this.directories.has(path)) {
            const pathWithSlash = path.endsWith('/') ? path : `${path}/`;

            const filesToDelete = Array.from(this.files.keys()).filter(f => f.startsWith(pathWithSlash));
            filesToDelete.forEach(f => this.files.delete(f));

            const dirsToDelete = Array.from(this.directories.keys()).filter(d => d.startsWith(pathWithSlash));
            dirsToDelete.forEach(d => this.directories.delete(d));
            
            this.directories.delete(path);
        } else {
            throw new Error(`File or directory not found in memory cache: ${path}`);
        }
    }

    public reset(): void {
        this.files.clear();
        this.directories.clear();
        this.directories.add('/');
    }
    
    public getTree(): FileSystemNode[] {
        const allPaths = new Set([...this.directories, ...this.files.keys()]);
        const nodes: { [path: string]: FileSystemNode } = {};

        // Create all nodes
        allPaths.forEach(path => {
            if (path === '/') return;
            nodes[path] = {
                name: path.split('/').pop()!,
                path: path,
                type: this.directories.has(path) ? 'directory' : 'file',
                children: this.directories.has(path) ? [] : undefined,
                content: this.files.get(path)
            };
        });

        const tree: FileSystemNode[] = [];
        // Link nodes to their parents
        Object.values(nodes).forEach(node => {
            const parentPath = this.getParentDir(node.path);
            if (parentPath === '/') {
                tree.push(node);
            } else if (nodes[parentPath]) {
                const parent = nodes[parentPath];
                if (parent && parent.type === 'directory') {
                    parent.children!.push(node);
                }
            } else {
                // This case can happen if a file is in a directory that isn't explicitly in the directories set
                // (e.g. from a partial update). We should add it to the root.
                tree.push(node);
            }
        });
        
        // Sort all children recursively
        const sortNodes = (nodeList: FileSystemNode[]) => {
            if(!nodeList) return;
            nodeList.sort((a, b) => {
                if (a.type === 'directory' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'directory') return 1;
                return a.name.localeCompare(b.name);
            });
            nodeList.forEach(n => {
                if (n.children) sortNodes(n.children);
            });
        };
        
        sortNodes(tree);

        return tree;
    }

    public async populateFromSandbox(sandbox: Sandbox): Promise<void> {
        this.reset();
        const recursiveList = async (path: string) => {
            const entries = await sandbox.fs.list(path);
            for (const entry of entries) {
                const fullPath = `${path === '/' ? '' : path}/${entry.name}`;
                if (entry.isDir) {
                    this.createDirectory(fullPath);
                    await recursiveList(fullPath);
                } else {
                    const content = await sandbox.fs.read(fullPath);
                    this.writeFile(fullPath, content);
                }
            }
        };
        await recursiveList('/');
    }
}