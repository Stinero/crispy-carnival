



import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { NeuralNetName } from '../types';
import { NEURAL_NET_HEX_COLORS } from '../constants';

interface NeuralSwarmVisualizerProps {
    activeNet: NeuralNetName;
}

const NET_POSITIONS: Record<string, { angle: number; distance: number, size: number }> = {
    CONSCIOUSNESS: { angle: -90, distance: 0.85, size: 14 },
    PLANNING: { angle: -45, distance: 0.7, size: 8 },
    MEMORY: { angle: 0, distance: 0.75, size: 10 },
    WEB_SEARCH: { angle: 30, distance: 0.8, size: 10 },
    FILE_IO: { angle: 60, distance: 0.7, size: 12 },
    DATABASE: { angle: 90, distance: 0.75, size: 10 },
    ALGORITHMS: { angle: 120, distance: 0.8, size: 10 },
    ANALYTICS: { angle: 150, distance: 0.7, size: 12 },
    EXECUTION: { angle: 180, distance: 0.8, size: 12 },
    CREATIVITY: { angle: 225, distance: 0.75, size: 10 },
    SYNTHESIS: { angle: 270, distance: 0.6, size: 8 },
    ORCHESTRATION: { angle: 0, distance: 0, size: 15 }, // Center
    NEUTRAL: { angle: 0, distance: 0, size: 0 },
};

export const NeuralSwarmVisualizer: React.FC<NeuralSwarmVisualizerProps> = ({ activeNet }) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let sketchInstance: p5;

        if (canvasRef.current) {
            const sketch = (p: p5) => {
                let nodes: any[] = [];
                let center: p5.Vector;
                const baseRadius = Math.min(canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight) / 2 * 0.8;

                class Node {
                    pos: p5.Vector;
                    vel: p5.Vector;
                    target: p5.Vector;
                    size: number;
                    color: string;
                    name: string;
                    p: p5;

                    constructor(p_instance: p5, name: string, angle: number, distance: number, size: number, color: string, center_vec: p5.Vector) {
                        this.p = p_instance;
                        this.name = name;
                        this.target = this.p.createVector(center_vec.x + distance * baseRadius * this.p.cos(this.p.radians(angle)), center_vec.y + distance * baseRadius * this.p.sin(this.p.radians(angle)));
                        this.pos = center_vec.copy();
                        this.vel = p5.Vector.random2D();
                        this.size = size;
                        this.color = color;
                    }

                    update() {
                        const toTarget = p5.Vector.sub(this.target, this.pos);
                        toTarget.mult(0.05);
                        this.vel.add(toTarget);
                        this.vel.limit(3);
                        this.pos.add(this.vel);
                    }

                    show() {
                        this.p.noStroke();
                        this.p.fill(this.color);

                        if (this.name === activeNet) {
                            const pulse = this.p.abs(this.p.sin(this.p.frameCount * 0.1)) * 10;
                            this.p.fill(this.color + '55');
                            this.p.ellipse(this.pos.x, this.pos.y, this.size + pulse, this.size + pulse);
                            this.p.fill(this.color);
                        }
                        
                        this.p.ellipse(this.pos.x, this.pos.y, this.size, this.size);
                    }
                }

                p.setup = () => {
                    p.createCanvas(canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight).parent(canvasRef.current!);
                    center = p.createVector(p.width / 2, p.height / 2);

                    for (const netName in NET_POSITIONS) {
                        if (netName !== 'NEUTRAL') {
                             const pos = NET_POSITIONS[netName as NeuralNetName];
                             if (pos) {
                                const color = NEURAL_NET_HEX_COLORS[netName as NeuralNetName] || '#ffffff';
                                nodes.push(new Node(p, netName, pos.angle, pos.distance, pos.size, color, center));
                             }
                        }
                    }
                };

                p.draw = () => {
                    p.background('rgba(0,0,0,0)');
                    
                    const orchestrationNode = nodes.find(n => n.name === 'ORCHESTRATION');
                    const consciousnessNode = nodes.find(n => n.name === 'CONSCIOUSNESS');

                    for (const node of nodes) {
                        node.update();
                        node.show();
                        
                        // Connect nets to orchestration
                        if (node.name !== 'ORCHESTRATION' && orchestrationNode) {
                            p.stroke(node.color + '44');
                            p.strokeWeight(1);
                            p.line(node.pos.x, node.pos.y, orchestrationNode.pos.x, orchestrationNode.pos.y);
                        }
                        // Connect orchestration to consciousness
                        if (node.name === 'ORCHESTRATION' && consciousnessNode) {
                             p.stroke(consciousnessNode.color + '88');
                             p.strokeWeight(1.5);
                             p.line(node.pos.x, node.pos.y, consciousnessNode.pos.x, consciousnessNode.pos.y);
                        }
                    }
                };
                
                p.windowResized = () => {
                    p.resizeCanvas(canvasRef.current!.offsetWidth, canvasRef.current!.offsetHeight);
                    center = p.createVector(p.width/2, p.height/2);
                    // Recalculate node targets
                     for (const node of nodes) {
                        const posData = NET_POSITIONS[node.name as NeuralNetName];
                        if(posData) {
                           node.target = p.createVector(center.x + posData.distance * baseRadius * p.cos(p.radians(posData.angle)), center.y + posData.distance * baseRadius * p.sin(p.radians(posData.angle)));
                        }
                    }
                }
            };

            sketchInstance = new p5(sketch);
        }

        return () => {
            if (sketchInstance) {
                sketchInstance.remove();
            }
        };
    }, [activeNet]);

    return <div ref={canvasRef} className="w-full h-full" />;
};