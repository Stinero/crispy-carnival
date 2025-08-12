import { ContentPart, TechniquePart, TechniqueName } from './types';

export const parseSuggestions = (content: string): { remainingContent: string, suggestions?: string[] } => {
    let suggestions: string[] | undefined;
    const suggestionsRegex = /<suggestions>([\s\S]*?)<\/suggestions>\s*$/i;
    const suggestionsMatch = content.match(suggestionsRegex);
    let remainingContent = content;
    
    if (suggestionsMatch && suggestionsMatch[1]) {
        try {
            let jsonString = suggestionsMatch[1].trim();
            const firstBracket = jsonString.indexOf('[');
            const lastBracket = jsonString.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket > firstBracket) {
                jsonString = jsonString.substring(firstBracket, lastBracket + 1);
            }
            suggestions = JSON.parse(jsonString);
            remainingContent = content.replace(suggestionsRegex, '').trim();
        } catch (e) {
            console.error("Failed to parse suggestions JSON:", e);
        }
    }
    return { remainingContent, suggestions };
};

export const parseThought = (content: string): { remainingContent: string, thought?: string } => {
    let thought: string | undefined;
    const thoughtRegex = /<thought>([\s\S]*?)<\/thought>\s*/i;
    const thoughtMatch = content.match(thoughtRegex);
    let remainingContent = content;

    if (thoughtMatch && thoughtMatch[1]) {
        thought = thoughtMatch[1].trim();
        remainingContent = content.replace(thoughtRegex, '').trim();
    }
    return { remainingContent, thought };
};

const parseAttributes = (attrString: string): Record<string, string> => {
    const attrs: Record<string, string> = {};
    const attrRegex = /(\w+)\s*=\s*"(.*?)"/g;
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        attrs[match[1]] = match[2];
    }
    return attrs;
};

export const parseContent = (xmlString: string): ContentPart[] => {
    if (!xmlString || !xmlString.includes('<')) {
        return [{ type: 'text', content: xmlString }];
    }

    const stack: TechniquePart[] = [{ type: 'column', content: '', children: [] }]; // A virtual root
    const tagRegex = /<(\/)?(technique|component):([a-zA-Z0-9_]+)([^>]*)>/g;
    let lastIndex = 0;

    xmlString.replace(tagRegex, (match, isClosing, tagType, tagName, attrs, offset) => {
        const parent = stack[stack.length - 1];

        if (offset > lastIndex) {
            const text = xmlString.substring(lastIndex, offset);
            if (text.trim()) {
                 parent.children!.push({ type: 'text', content: text });
            }
        }
        lastIndex = offset + match.length;
        
        if (isClosing) {
            if (stack.length > 1) { // Don't pop the root
                stack.pop();
            }
        } else {
            const attributes = parseAttributes(attrs);
            const newNode: TechniquePart = {
                type: tagName as TechniqueName,
                content: '',
                attributes,
                children: []
            };
            parent.children!.push(newNode);
            stack.push(newNode);
        }
        return match; // required by String.replace
    });

    // Add any final text content
    if (lastIndex < xmlString.length) {
        const text = xmlString.substring(lastIndex);
        if (text.trim()) {
            stack[stack.length - 1].children!.push({ type: 'text', content: text });
        }
    }
    
    // The parser used a virtual root node. We return its children.
    const result = stack[0].children!;

    // Post-process to flatten single text children into parent's content
    const simplify = (parts: ContentPart[]): ContentPart[] => {
        return parts.map(part => {
            if (part.type === 'text' || !(part as TechniquePart).children) {
                return part;
            }
            
            const techPart = part as TechniquePart;
            if (techPart.children && techPart.children.length === 1 && techPart.children[0].type === 'text') {
                return { ...techPart, content: techPart.children[0].content, children: [] };
            } else if (techPart.children) {
                 return { ...techPart, children: simplify(techPart.children) };
            }
            return part;
        });
    };

    const simplifiedResult = simplify(result);
    
    // If after all that, there's just one text node, return it as is.
    if (simplifiedResult.length === 1 && simplifiedResult[0].type === 'text') {
        return [{ type: 'text', content: xmlString }];
    }
    
    return simplifiedResult.length > 0 ? simplifiedResult : [{ type: 'text', content: xmlString }];
};