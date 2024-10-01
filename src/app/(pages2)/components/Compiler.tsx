import React, { useState, useEffect, useRef } from 'react';
import { NodeProps, useReactFlow, Position } from 'reactflow';
import { Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { TbMathMaxMin } from "react-icons/tb";
import { BsThreeDots } from "react-icons/bs";
import CustomHandle from './CustomHandle';
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';

const CompilerNode = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, setNodes, getNode } = useReactFlow();
    const [operation, setOperation] = useState<string>(data.operation);
    const [connectedVariableType, setConnectedVariableType] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchConnectedVariableType = () => {
        const edges = getEdges();
        const incomingEdge = edges.find((edge) => edge.target === id);

        if (incomingEdge) {
            const connectedNode = getNode(incomingEdge.source);
            if (connectedNode?.data?.variableType) {
                setConnectedVariableType(connectedNode.data.variableType);
            }
        } else {
            setConnectedVariableType(null);
        }
    };

    useEffect(() => {
        fetchConnectedVariableType();
        const interval = setInterval(fetchConnectedVariableType, 500);

        return () => clearInterval(interval);
    }, [getEdges, getNode, id]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, operation: value } } : node
            )
        );
    };

    const handleDeleteNode = () => {
        setNodes((nodes) => nodes.filter(node => node.id !== id));
        message.success('Node deleted successfully.');
    };

    const openGlobalVariableModal = () => {
        setIsModalVisible(true);
    };

    const handleSaveAsGlobalVariable = (globalVariableName: string) => {
        if (!operation) {
            message.error("No operation to save as a global variable.");
            return;
        }

        const globalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        const newGlobalVariable = {
            GlobalVariableName: globalVariableName,
            type: 'compiler_type',
            nodeID: id,
            operation,
        };

        globalVariables.push(newGlobalVariable);
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));

        message.success('Compiler operation saved as global variable.');
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
            <div className={`${styles['nodeBox']} ${styles.compiler}`}>
                <div className={`flex gap-1 ${styles['node-main']}`}>
                    <div className={`flex gap-1 ${styles['node']}`}>
                        <div className={`flex gap-1 ${styles['nodewrap']}`}>
                            <TbMathMaxMin className={styles.iconFlag} />
                            <div className={styles['node-text']}>
                                <h6>{data.label || 'Compiler'}</h6>
                                {connectedVariableType && <span>Type: {connectedVariableType}</span>}
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
                            <Select.Option value="min">Min</Select.Option>
                            <Select.Option value="max">Max</Select.Option>
                            <Select.Option value="mean">Mean</Select.Option>
                            <Select.Option value="median">Median</Select.Option>
                        </Select>
                    </div>
                </div>
            </div>

            <CustomHandle
                nodeId={id}
                id="input"
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

export default CompilerNode;
