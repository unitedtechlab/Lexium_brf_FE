import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import { Select, message, Dropdown } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { TbMathIntegralX } from "react-icons/tb";
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';
import CustomHandle from './CustomHandle';

const ModifierNode = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, getNodes, setNodes } = useReactFlow();
    const [operation, setOperation] = useState<string>(data.operation || 'absolute');
    const [firstConnectedNodeType, setFirstConnectedNodeType] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const errorShownRef = useRef({ target: false, source: false });

    const showErrorOnce = (msg: string, type: 'source' | 'target') => {
        if (!errorShownRef.current[type]) {
            message.error(msg);
            errorShownRef.current[type] = true;
            setTimeout(() => {
                errorShownRef.current[type] = false;
            }, 2000);
        }
    };

    useEffect(() => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, operation } } : node
            )
        );
        if (data.variableType) {
            setFirstConnectedNodeType(data.variableType);
        }

    }, [operation, id, setNodes, data.variableType]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
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
            type: 'modifier_node',
            operation: operation,
            variableType: firstConnectedNodeType || 'unknown',
        };

        globalVariables.push(newGlobalVariable);
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));

        message.success('Node saved as a global variable.');
        window.dispatchEvent(new Event('globalVariableUpdated'));
        setIsModalVisible(false);
    };

    // Dropdown menu for delete and save as global variable
    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        },
        {
            label: 'Save as Global Variable',
            key: '1',
            onClick: openGlobalVariableModal
        }
    ];

    return (
        <div>
            <div className={`${styles['nodeBox']} ${styles.modifier}`} style={{ maxWidth: "300px" }}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <TbMathIntegralX className={styles.iconFlag} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || 'Modifier'}</h6>
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
                    <div style={{ width: '100%' }}>
                        <Select
                            value={operation}
                            style={{ width: '100%' }}
                            onChange={handleOperationChange}
                            getPopupContainer={(triggerNode) => triggerNode.parentNode}
                            className="nodrag"
                        >
                            <Select.Option value="absolute">Absolute</Select.Option>
                            <Select.Option value="round">Round</Select.Option>
                        </Select>
                    </div>
                </div>
            </div>

            <CustomHandle
                nodeId={id}
                id="target"
                type="target"
                position={Position.Left}
                connectioncount={Infinity}
            />

            <CustomHandle
                nodeId={id}
                id="source"
                type="source"
                position={Position.Right}
                connectioncount={1}
            />

            <SaveGlobalVariableModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSave={handleSaveAsGlobalVariable}
            />
        </div>
    );
};

export default ModifierNode;
