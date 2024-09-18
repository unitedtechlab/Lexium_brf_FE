import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';

const AdditionSubNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [connectedValues, setConnectedValues] = useState<any>({
        additionNodeValues: [],
        substractionNodeValues: [],
    });
    const [firstConnectedNodeType, setFirstConnectedNodeType] = useState<string | null>(null);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        let additionNodeValues: any[] = [];
        let substractionNodeValues: any[] = [];
        let firstConnectedType: string | null = null;

        edges.forEach((edge) => {
            const sourceNode = getNode(edge.source);
            const sourceNodeData = sourceNode?.data;

            if (!firstConnectedType && sourceNodeData?.variableType) {
                firstConnectedType = sourceNodeData.variableType;
            }

            const prepareNodeData = (nodeData: any) => {
                const cleanData: any = { variableType: nodeData.variableType || 'unknown' };

                Object.keys(nodeData).forEach((key) => {
                    if (key.startsWith('variable') && nodeData[key]) {
                        cleanData[key] = nodeData[key];
                    }
                });

                return cleanData;
            };

            if (edge.targetHandle === 'target1' && sourceNodeData) {
                additionNodeValues.push({
                    id: sourceNode.id,
                    data: prepareNodeData(sourceNodeData),
                });
            }

            if (edge.targetHandle === 'target2' && sourceNodeData) {
                substractionNodeValues.push({
                    id: sourceNode.id,
                    data: prepareNodeData(sourceNodeData),
                });
            }
        });

        setConnectedValues({ additionNodeValues, substractionNodeValues });
        setFirstConnectedNodeType(firstConnectedType);
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            additionNodeValues,
                            substractionNodeValues,
                        },
                    }
                    : node
            )
        );
    }, [getEdges, getNode, id, setNodes]);

    const isValidConnection = (connection: Connection) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        return edges.length < 4;
    };

    return (
        <div>
            <div className={styles['starting-point-label']}>+</div>
            <div className={styles['nodeBox']}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <Image src={TableImage} alt='Table Image' width={32} height={32} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Addition / Subtraction"}</h6>
                                <span>{firstConnectedNodeType ? `Type: ${firstConnectedNodeType}` : "No Type Connected"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['minus-point-label']}>-</div>

            <Handle
                type="target"
                position={Position.Left}
                id="target1"
                isValidConnection={isValidConnection}
                style={{ top: '35%' }}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target2"
                isValidConnection={isValidConnection}
                style={{ top: '65%' }}
            />
            <Handle type="source" position={Position.Right} id="source" />
        </div>
    );
};

export default AdditionSubNode;
