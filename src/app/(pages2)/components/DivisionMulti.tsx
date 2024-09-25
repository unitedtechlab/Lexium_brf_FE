import React, { useState, useEffect, useRef } from 'react';
import { Handle, NodeProps, Position, useReactFlow, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { message, Dropdown } from 'antd';
import { PiMathOperationsBold } from "react-icons/pi";
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';

const MultiplyDivide = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [connectedValues, setConnectedValues] = useState<any>({
        multiplyValues: [],
        divideValues: [],
    });
    const [firstConnectedNodeType, setFirstConnectedNodeType] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
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

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter(node => node.id !== id));
        message.success('Node deleted successfully');
    };

    const openGlobalVariableModal = () => {
        setIsModalVisible(true);
    };

    const handleSaveAsGlobalVariable = (globalVariableName: string) => {
        const globalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        const newGlobalVariable = {
            GlobalVariableName: globalVariableName,
            nodeID: id,
            type: 'multiply_divide_type',
            multiplyValues: connectedValues.multiplyValues,
            divideValues: connectedValues.divideValues,
            variableType: firstConnectedNodeType || 'unknown',
        };

        globalVariables.push(newGlobalVariable);
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));

        message.success('Node saved as a global variable.');
        window.dispatchEvent(new Event('globalVariableUpdated'));
        setIsModalVisible(false);
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        },
        {
            label: 'Save as a Global Variable',
            key: '1',
            onClick: openGlobalVariableModal
        }
    ];

    return (
        <div>
            <div className={styles['plus-point-label']}>
                <FiPlusCircle />
            </div>
            <div className={`${styles['nodeBox']} ${styles.multidivide}`}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <PiMathOperationsBold className={styles.iconFlag} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || "Multiplication / Division"}</h6>
                                <span>{firstConnectedNodeType ? `Type: ${firstConnectedNodeType}` : "No Type Connected"}</span>
                            </div>
                        </div>
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                        >
                            <a onClick={(e) => e.preventDefault()} className='iconFont'>
                                <BsThreeDots />
                            </a>
                        </Dropdown>
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

            <SaveGlobalVariableModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSave={handleSaveAsGlobalVariable}
            />
        </div>
    );
};

export default MultiplyDivide;
