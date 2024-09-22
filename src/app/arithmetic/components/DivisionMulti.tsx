import React, { useState, useEffect, useRef } from 'react';
import { Handle, NodeProps, Position, useReactFlow, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';
import { FiDivideCircle, FiPlusCircle } from "react-icons/fi";
import { message } from 'antd';

const DivisionMultiply = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [connectedValues, setConnectedValues] = useState<any>({
        multiplyValues: [],
        divideValues: [],
    });
    const [firstConnectedNodeType, setFirstConnectedNodeType] = useState<string | null>(null);

    const messageShownRef = useRef(false);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        let multiplyValues: any[] = [];
        let divideValues: any[] = [];
        let firstConnectedType: string | null = null;
        let sourceIds: string[] = [];

        edges.forEach((edge) => {
            const sourceNode = getNode(edge.source);
            const sourceNodeData = sourceNode?.data;

            if (!firstConnectedType && sourceNodeData?.variableType) {
                firstConnectedType = sourceNodeData.variableType;
            }

            if (edge.targetHandle === 'target1' && sourceNode) {
                multiplyValues.push({ id: sourceNode.id });
                sourceIds.push(sourceNode.id);
            }

            if (edge.targetHandle === 'target2' && sourceNode) {
                divideValues.push({ id: sourceNode.id });
                sourceIds.push(sourceNode.id);
            }
        });

        setConnectedValues({ multiplyValues, divideValues });
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
                            multiplyValues,
                            divideValues,
                        },
                        connectedEdges: sourceIds.length > 0
                            ? [{ source: sourceIds.length === 1 ? sourceIds[0] : sourceIds, target: '' }]
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
        console.log("connection", connection)
        console.log("connectedValues", connectedValues)
        if (edges.length >= 1 && connection.sourceHandle === 'source') {
            showMessageOnce('Only one outgoing connection is allowed from the source.');
            return false;
        }
        const existingConnections = getEdges().filter((edge) => edge.target === id);

        const hasTarget1Connection = existingConnections.some(edge => edge.targetHandle === 'target1');
        const hasTarget2Connection = existingConnections.some(edge => edge.targetHandle === 'target2');
        if (connection.targetHandle === 'target1' && hasTarget1Connection) {
            showMessageOnce('Only one connection is allowed.')
            return false;
        }
        if (connection.targetHandle === 'target2' && hasTarget2Connection) {
            showMessageOnce('Only one connection is allowed.');
            return false;
        }
        return true;
    };

    return (
        <div>
            <div className={styles['multiply-point-label']}>
                <FiPlusCircle />
            </div>
            <div className={styles['nodeBox']}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <Image src={TableImage} alt='Table Image' width={32} height={32} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Multiplication / Division"}</h6>
                                <span>{firstConnectedNodeType ? `Type: ${firstConnectedNodeType}` : "No Type Connected"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles['minus-point-label']}>
                <FiDivideCircle />
            </div>

            {/* Handles for connections */}
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
            <Handle
                type="source"
                position={Position.Right}
                id="source"
                isValidConnection={isValidConnection}
            />
        </div>
    );
};

export default DivisionMultiply;
