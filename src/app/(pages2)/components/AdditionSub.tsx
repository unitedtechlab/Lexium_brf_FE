import React, { useState, useEffect, useRef } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { message, Dropdown } from 'antd';
import { PiMathOperationsBold } from "react-icons/pi";
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';
import CustomHandle from './CustomHandle';

const AdditionSubNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [connectedValues, setConnectedValues] = useState<any>({
        additionNodeValues: [],
        substractionNodeValues: [],
    });
    const [firstConnectedNodeType, setFirstConnectedNodeType] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

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
            type: 'add_sub_type',
            additionNodeValues: connectedValues.additionNodeValues,
            substractionNodeValues: connectedValues.substractionNodeValues,
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

            {/* Multiple target connections */}
            <Handle
                type="target"
                position={Position.Left}
                id="target1"
                className={styles.toppoint}
            />
            <Handle
                type="target"
                position={Position.Left}
                id="target2"
                className={styles.bottompoint}
            />

            <CustomHandle
                id="source"
                type="source"
                position={Position.Right}
                connectioncount={1}
                className={styles.customHandle}
            />

            <SaveGlobalVariableModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSave={handleSaveAsGlobalVariable}
            />
        </div>
    );
};

export default AdditionSubNode;
