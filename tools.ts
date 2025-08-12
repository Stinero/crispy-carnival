import { FunctionDeclaration, Type } from '@google/genai';

export const ALL_TOOLS: FunctionDeclaration[] = [
    {
        name: "search_web",
        description: "Search the web and return top results.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "The search query." },
                max_results: { type: Type.INTEGER, minimum: 1, maximum: 10, description: "Maximum number of results to return." }
            },
            required: ["query"]
        }
    },
    {
        name: "render_markdown",
        description: "Renders complex Markdown content in a dedicated preview panel. Use this for rich, multi-paragraph text with formatting like headers, blockquotes, and tables that goes beyond the simpler `create_table` or `bullet_points` techniques.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A descriptive title for the Markdown content." },
                markdown_content: { type: Type.STRING, description: "The Markdown text to be rendered." },
                embed_in_chat: { type: Type.BOOLEAN, description: "Whether to embed the preview directly in the chat message." }
            },
            required: ["title", "markdown_content"]
        }
    },
    {
        name: "run_python",
        description: "Execute a Python snippet in a temporary environment (no internet).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The Python code to execute." },
                timeout_sec: { type: Type.INTEGER, minimum: 1, maximum: 30, description: "Execution timeout in seconds." }
            },
            required: ["code"]
        }
    },
    {
        name: "run_bash",
        description: "Run a shell command. Use e2b_bash for a sandboxed environment.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                cmd: { type: Type.STRING, description: "The bash command to execute." },
                timeout_sec: { type: Type.INTEGER, minimum: 1, maximum: 60, description: "Execution timeout in seconds." }
            },
            required: ["cmd"]
        }
    },
     {
        name: "wikipedia_search",
        description: "Search Wikipedia for a query.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "The search query." },
                max_results: { type: Type.INTEGER, minimum: 1, maximum: 10, description: "Maximum number of search results." }
            },
            required: ["query"]
        }
    },
    {
        name: "wikipedia_summary",
        description: "Get a summary of a Wikipedia article.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "The exact title of the Wikipedia article." }
            },
            required: ["title"]
        }
    },
    {
        name: "e2b_python",
        description: "Execute Python in an E2B sandbox. Optionally install packages first.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The Python code to execute in the sandbox." },
                packages: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of pip packages to install before execution." },
                timeout_sec: { type: Type.INTEGER, minimum: 1, maximum: 300, description: "Execution timeout in seconds." }
            },
            required: ["code"]
        }
    },
    {
        name: "e2b_bash",
        description: "Run a shell command in an E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                cmd: { type: Type.STRING, description: "The bash command to execute." },
                timeout_sec: { type: Type.INTEGER, minimum: 1, maximum: 300, description: "Execution timeout in seconds." }
            },
            required: ["cmd"]
        }
    },
    {
        name: "e2b_browser_fetch",
        description: "Headless browser fetch with Playwright in E2B. Returns title + extracted text.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING, description: "The URL to fetch." },
                timeout_sec: { type: Type.INTEGER, minimum: 5, maximum: 180, description: "Fetch timeout in seconds." }
            },
            required: ["url"]
        }
    },
    {
        name: "e2b_write_file",
        description: "Writes content to a file in the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path of the file to write to." },
                content: { type: Type.STRING, description: "The content to write to the file." }
            },
            required: ["path", "content"]
        }
    },
    {
        name: "e2b_read_file",
        description: "Reads the content of a file from the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path of the file to read." }
            },
            required: ["path"]
        }
    },
    {
        name: "e2b_list_files",
        description: "Lists files in a directory in the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path of the directory to list." }
            },
            required: ["path"]
        }
    },
    {
        name: "e2b_create_directory",
        description: "Creates a directory (and any parent directories) in the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path of the directory to create." }
            },
            required: ["path"]
        }
    },
    {
        name: "e2b_move_file",
        description: "Moves or renames a file in the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                source_path: { type: Type.STRING, description: "The original path of the file." },
                destination_path: { type: Type.STRING, description: "The new path for the file." }
            },
            required: ["source_path", "destination_path"]
        }
    },
    {
        name: "e2b_delete",
        description: "Deletes a file or directory in the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path of the file or directory to delete." }
            },
            required: ["path"]
        }
    },
    {
        name: "render_p5js_sketch",
        description: "Renders a p5.js sketch in a special UI preview drawer. The user can see the animation or simulation directly. Use this to show visual outputs. The code should be self-contained and typically includes setup() and draw() functions. The p5.js library is already loaded.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A descriptive title for the p5.js sketch." },
                code: { type: Type.STRING, description: "The complete, self-contained p5.js JavaScript code to be rendered." },
                embed_in_chat: { type: Type.BOOLEAN, description: "Whether to embed the preview directly in the chat message." }
            },
            required: ["title", "code"]
        }
    },
    {
        name: "e2b_create_word_doc",
        description: "Creates a Microsoft Word (.docx) document with the given content in the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path and filename for the .docx file." },
                content: { type: Type.STRING, description: "The text content to put in the document." }
            },
            required: ["path", "content"]
        }
    },
    {
        name: "e2b_create_excel_file",
        description: "Creates a Microsoft Excel (.xlsx) spreadsheet from JSON data in the E2B sandbox.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path and filename for the .xlsx file." },
                data: { type: Type.STRING, description: "A JSON string representing an array of objects or an array of arrays to be converted into a spreadsheet." }
            },
            required: ["path", "data"]
        }
    },
    {
        name: "draw_on_canvas",
        description: "Draws shapes and text on a canvas in a special UI preview drawer. Use this to create simple diagrams, charts, or visualizations.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A descriptive title for the drawing." },
                instructions: {
                    type: Type.ARRAY,
                    description: "An array of drawing instruction objects.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            shape: { type: Type.STRING, enum: ['rect', 'circle', 'line', 'text'], description: "The shape to draw: 'rect', 'circle', 'line', or 'text'." },
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                            width: { type: Type.NUMBER, description: "For 'rect'." },
                            height: { type: Type.NUMBER, description: "For 'rect'." },
                            radius: { type: Type.NUMBER, description: "For 'circle'." },
                            x2: { type: Type.NUMBER, description: "End x for 'line'." },
                            y2: { type: Type.NUMBER, description: "End y for 'line'." },
                            text: { type: Type.STRING, description: "For 'text'." },
                            font: { type: Type.STRING, description: "CSS font string for 'text', e.g., '16px Arial'." },
                            fill: { type: Type.STRING, description: "Fill color, e.g., '#FF0000' or 'red'." },
                            stroke: { type: Type.STRING, description: "Stroke color." },
                            lineWidth: { type: Type.NUMBER, description: "Line width for strokes." },
                        },
                        required: ["shape", "x", "y"]
                    }
                }
            },
            required: ["title", "instructions"]
        }
    },
    {
        name: "create_report",
        description: "Analyzes a given text and generates a *new*, structured report or summary based on it. This is a transformation tool. For simply *formatting* a final answer, use the appropriate `<technique:...>` tags directly.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                text_content: { type: Type.STRING, description: "The input text to analyze and summarize." },
                format: { type: Type.STRING, description: "The desired output format. Examples: 'bullet_points', 'executive_summary', 'haiku'." }
            },
            required: ["text_content", "format"]
        }
    },
    {
        name: "create_interactive_poll",
        description: "Creates an interactive poll UI directly in the chat. Use this to ask the user for their opinion on a set of options.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "The question to ask the user." },
                options: {
                    type: Type.ARRAY,
                    description: "A list of options for the poll.",
                    items: { type: Type.STRING }
                }
            },
            required: ["question", "options"]
        }
    },
    {
        name: "generate_3d_text_scene",
        description: "Generates an interactive 3D scene with text. Use this for a more creative and engaging display of a single word or a short phrase.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "The text to display in 3D." },
                textColor: { type: Type.STRING, description: "The color of the text (e.g., '#FF0000', 'blue')." },
                shape: { type: Type.STRING, enum: ['sphere', 'box', 'torus'], description: "The 3D shape to accompany the text." },
                rotationSpeed: { type: Type.NUMBER, description: "The speed of rotation for the 3D object (e.g., 0.01)." },
            },
            required: ["text", "textColor", "shape", "rotationSpeed"]
        }
    },
    {
        name: "generate_image",
        description: "Generates an image based on a descriptive prompt. Returns the generated image to be displayed to the user.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: "A detailed, descriptive prompt for the image to be generated." },
                numberOfImages: { type: Type.INTEGER, description: "The number of images to generate. Defaults to 1.", minimum: 1, maximum: 4 },
                aspectRatio: { type: Type.STRING, enum: ["1:1", "16:9", "9:16", "4:3", "3:4"], description: "The aspect ratio of the generated image. Defaults to '1:1'."}
            },
            required: ["prompt"]
        }
    },
    {
        name: "commit_memory",
        description: "Commits a piece of information to the agent's long-term memory for future recall. Use this for key facts, user preferences, or important context that should persist across conversations.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING, description: "The piece of information or text to commit to memory." },
            },
            required: ["text"]
        }
    },
    {
        name: "recall_memory",
        description: "Searches the agent's long-term memory for information relevant to a query. Returns a list of memories that may help answer the user's current request.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "The search query to find relevant memories." },
                max_results: { type: Type.INTEGER, description: "The maximum number of memories to recall." }
            },
            required: ["query"]
        }
    },
    {
        name: "delegate_task",
        description: "Delegates a specific task to another specialized agent. Use this when the user's request is outside your primary expertise, such as asking a developer to write a blog post.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                agent_name: {
                    type: Type.STRING,
                    description: "The name of the agent to delegate to. Must be one of: 'Creative Assistant', 'Developer Agent', 'Data Analyst'."
                },
                task_description: {
                    type: Type.STRING,
                    description: "A clear, complete, and standalone description of the task for the delegate agent. Should include all necessary context."
                }
            },
            required: ["agent_name", "task_description"]
        }
    },
    {
        name: "code_linter",
        description: "Performs static analysis on a code snippet to find errors and style issues.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The code snippet to lint." }
            },
            required: ["code"]
        }
    },
    {
        name: "run_tests",
        description: "Executes the test suite for the project and returns the results. Use this after making code changes to verify they didn't break anything.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                command: { type: Type.STRING, description: "The command to run the tests (e.g., 'npm test', 'pytest')." }
            },
            required: ["command"]
        }
    },
    {
        name: "dependency_inspector",
        description: "Scans code to identify required libraries and imports.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The code snippet to inspect for dependencies." }
            },
            required: ["code"]
        }
    },
    {
        name: "refactor_code",
        description: "Takes a code snippet and an instruction, and attempts to rewrite the code accordingly.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The code snippet to refactor." },
                instruction: { type: Type.STRING, description: "The instruction for refactoring (e.g., 'make this more readable', 'convert to an async function')." }
            },
            required: ["code", "instruction"]
        }
    },
    {
        name: "code_reviewer",
        description: "Submits code for an automated review. It checks for style, best practices, and potential issues. Returns a list of suggestions.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The code snippet to be reviewed." },
                diff: { type: Type.STRING, description: "Optional diff string showing the changes made to the code." }
            },
            required: ["code"]
        }
    },
    {
        name: "sort_data",
        description: "Sorts an array of objects or simple values.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                data: { type: Type.ARRAY, description: "The array to sort." },
                sort_key: { type: Type.STRING, description: "The key to sort by if data is an array of objects." },
                order: { type: Type.STRING, enum: ['asc', 'desc'], description: "The sort order." }
            },
            required: ["data"]
        }
    },
    {
        name: "graph_traverse",
        description: "Performs a traversal (BFS or DFS) on a graph represented as an adjacency list.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                graph: { type: Type.OBJECT, description: "The graph as an adjacency list, e.g., {'A': ['B', 'C']}" },
                start_node: { type: Type.STRING, description: "The node to start the traversal from." },
                method: { type: Type.STRING, enum: ['bfs', 'dfs'], description: "Traversal method: 'bfs' (Breadth-First Search) or 'dfs' (Depth-First Search)." }
            },
            required: ["graph", "start_node", "method"]
        }
    },
    {
        name: "diff_text",
        description: "Computes the line-by-line difference between two blocks of text.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                text1: { type: Type.STRING, description: "The first block of text." },
                text2: { type: Type.STRING, description: "The second block of text." }
            },
            required: ["text1", "text2"]
        }
    },
    {
        name: "execute_algorithm",
        description: "A generic tool to execute a named algorithm with given parameters. (This is a placeholder for more complex algorithmic tools).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the algorithm to execute." },
                params: { type: Type.OBJECT, description: "A JSON object of parameters for the algorithm." }
            },
            required: ["name", "params"]
        }
    },
    {
        name: "create_project_scaffold",
        description: "Creates a complete directory and file structure for a new software project based on a specified template.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                project_name: { type: Type.STRING, description: "The name of the project, which will be the root directory." },
                project_type: { type: Type.STRING, "enum": ['react-vite-ts', 'python-cli'], description: "The type of project to scaffold. Supported types: 'react-vite-ts', 'python-cli'." }
            },
            required: ["project_name", "project_type"]
        }
    },
    {
        name: "generate_documentation",
        description: "Analyzes the project's file structure and generates a README.md file.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                project_path: { type: Type.STRING, description: "The root path of the project to document." },
                description: { type: Type.STRING, description: "A brief, one-sentence description of the project's purpose to include in the README." }
            },
            required: ["project_path", "description"]
        }
    },
    {
        name: "edit_file",
        description: "Reads a file, applies edits based on natural language instructions, and presents the changes to the user for approval before writing the new content. This is the preferred method for modifying existing code.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: { type: Type.STRING, description: "The path of the file to edit." },
                instructions: { type: Type.STRING, description: "Clear, natural language instructions on what to change in the file. For example: 'Add a new state variable for a counter' or 'Change the button color to blue'." }
            },
            required: ["path", "instructions"]
        }
    },
    {
        name: "execute_sql",
        description: "Executes a SQL query against the in-session database. Supports basic CREATE TABLE, INSERT, and SELECT.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: "The SQL query to execute." },
                database_id: { type: Type.STRING, description: "Optional ID for the database to use." }
            },
            required: ["query"]
        }
    },
    {
        name: "schema_designer",
        description: "Takes a natural language description and generates a SQL CREATE TABLE statement.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                description: { type: Type.STRING, description: "A description of the table's purpose and fields (e.g., 'a table for users with names and emails')." },
            },
            required: ["description"]
        }
    },
    {
        name: "visualize_db_schema",
        description: "Takes a SQL CREATE TABLE statement and returns a Mermaid.js string to visualize the schema. The model should then wrap this in a <technique:code_block language='mermaid'> tag.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                schema_sql: { type: Type.STRING, description: "The SQL `CREATE TABLE` statement to visualize." },
            },
            required: ["schema_sql"]
        }
    },
    {
        name: "generate_unit_tests",
        description: "Analyzes a file and generates unit test code for its functions.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                file_path: { type: Type.STRING, description: "The path to the file to generate tests for." },
                function_name: { type: Type.STRING, description: "Optional: The name of a specific function to test." }
            },
            required: ["file_path"]
        }
    },
    {
        name: "api_endpoint_tester",
        description: "Simulates a request to an API endpoint and returns the mock response.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                url: { type: Type.STRING, description: "The URL of the API endpoint." },
                method: { type: Type.STRING, enum: ['GET', 'POST', 'PUT', 'DELETE'], description: "The HTTP method to use." },
                headers: { type: Type.OBJECT, description: "A JSON object of request headers." },
                body: { type: Type.OBJECT, description: "A JSON object for the request body (for POST/PUT)." }
            },
            required: ["url", "method"]
        }
    },
    {
        name: "sentiment_analyzer",
        description: "Analyzes the sentiment of a given text.",
        parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING, description: "The text to analyze." } }, required: ["text"] }
    },
    {
        name: "code_complexity_analyzer",
        description: "Analyzes code complexity and returns metrics like cyclomatic complexity.",
        parameters: { type: Type.OBJECT, properties: { code: { type: Type.STRING, description: "The code to analyze." } }, required: ["code"] }
    },
    {
        name: "csv_to_json",
        description: "Converts CSV formatted text to a JSON array.",
        parameters: { type: Type.OBJECT, properties: { csv_data: { type: Type.STRING, description: "The CSV data as a string." } }, required: ["csv_data"] }
    },
    {
        name: "data_analyzer",
        description: "Calculates descriptive statistics for a JSON array of objects.",
        parameters: { type: Type.OBJECT, properties: { json_data: { type: Type.ARRAY, items: { type: Type.OBJECT } } }, required: ["json_data"] }
    },
    {
        name: "generate_chart",
        description: "Generates a chart from data and renders it in the preview panel. Supports 'bar', 'line', and 'pie' charts.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                chart_type: { type: Type.STRING, enum: ["bar", "line", "pie"] },
                data: { type: Type.OBJECT, description: "Data for the chart, often following chart.js format (e.g., { labels: [...], datasets: [{ label: '...', data: [...] }] })." },
                title: { type: Type.STRING, description: "The title of the chart." }
            },
            required: ["chart_type", "data", "title"]
        }
    },
    {
        name: "text_to_structured_data",
        description: "Extracts structured data from a block of text based on a provided JSON schema.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                text_content: { type: Type.STRING, description: "The unstructured text to analyze." },
                json_schema: { type: Type.OBJECT, description: "A JSON schema describing the data to extract." }
            },
            required: ["text_content", "json_schema"]
        }
    },
    {
        name: "code_debugger",
        description: "Simulates running code in a debugger to trace execution and inspect variables. Helps find bugs.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                code: { type: Type.STRING, description: "The code snippet to debug." },
                language: { type: Type.STRING, enum: ['python', 'javascript'], description: "The programming language of the code." }
            },
            required: ["code", "language"]
        }
    },
];