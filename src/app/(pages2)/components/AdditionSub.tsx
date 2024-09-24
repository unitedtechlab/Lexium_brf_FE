import React, { useState, useEffect, useRef } from 'react';
import { Handle, NodeProps, Position, useReactFlow, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { message } from 'antd';
import { PiMathOperationsBold } from "react-icons/pi";

const AdditionSubNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [connectedValues, setConnectedValues] = useState<any>({
        additionNodeValues: [],
        substractionNodeValues: [],
    });
    const [firstConnectedNodeType, setFirstConnectedNodeType] = useState<string | null>(null);
    const messageShownRef = useRef(false);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        let additionNodeValues: any[] = [];
        let substractionNodeValues: any[] = [];
        let firstConnectedType: string | null = null;
        let sourceIds: string[] = [];

        edges.forEach((edge) => {
            const sourceNode = getNode(edge.source);
            const sourceNodeData = sourceNode?.data;
            if (!firstConnectedType && sourceNodeData?.variableType) {
                firstConnectedType = sourceNodeData.variableType;
            }

            if (edge.targetHandle === 'target1' && sourceNode) {
                additionNodeValues.push({ id: sourceNode.id });
                sourceIds.push(sourceNode.id);
            }

            if (edge.targetHandle === 'target2' && sourceNode) {
                substractionNodeValues.push({ id: sourceNode.id });
                sourceIds.push(sourceNode.id);
            }
        });

        setConnectedValues({ additionNodeValues, substractionNodeValues });
        if (data.variableType) {
            setFirstConnectedNodeType(data.variableType);
        }

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
                        connectedEdges: sourceIds.length > 0
                            ? [{ source: sourceIds, target: '' }]
                            : [],
                    }
                    : node
            )
        );
    }, [getEdges, getNode, id, setNodes, data.variableType]);

    const showMessageOnce = (msg: string) => {
        if (!messageShownRef.current) {
            message.error(msg);
            messageShownRef.current = true;
            setTimeout(() => {
                messageShownRef.current = false;
            }, 2000);
        }
    };

    const isValidConnection = (connection: Connection) => {
        const edges = getEdges().filter((edge) => edge.source === id);

        if (edges.length >= 1 && connection.sourceHandle === 'source') {
            showMessageOnce('Only one outgoing connection is allowed from the source.');
            return false;
        }
        return true;
    };

    return (
        <div>
            <div className={styles['plus-point-label']}>
                <FiPlusCircle />
            </div>
            <div className={`${styles['nodeBox']} ${styles.additionsub}`}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <PiMathOperationsBold className={styles.iconFlag} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Addition / Subtraction"}</h6>
                                <span>{firstConnectedNodeType ? `Type: ${firstConnectedNodeType}` : "No Type Connected"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['minus-point-label']}>
                <FiMinusCircle />
            </div>

            <Handle
                type="target"
                position={Position.Left}
                id="target1"
                isValidConnection={isValidConnection}
                className={styles.toppoint}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target2"
                isValidConnection={isValidConnection}
                className={styles.bottompoint}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="source"
                isValidConnection={isValidConnection}
            />
        </div>
    );
};

export default AdditionSubNode;
