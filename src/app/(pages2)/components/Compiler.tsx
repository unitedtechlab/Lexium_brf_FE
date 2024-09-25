import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection } from 'reactflow';
import { Select, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { TbMathMaxMin } from "react-icons/tb";
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';

const CompilerNode = ({ id, data, type }: NodeProps<any>) => {
    const { getEdges, setNodes } = useReactFlow();
    const [operation, setOperation] = useState<string>(data.operation);
    const errorShownRef = useRef({ target: false, source: false });
    const [isModalVisible, setIsModalVisible] = useState(false);

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
    }, [operation, id, setNodes]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
    };

    const isValidTargetConnection = (connection: Connection) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        if (edges.length >= 1) {
            showErrorOnce('Only one incoming connection is allowed to the target.', 'target');
            return false;
        }
        return true;
    };

    const isValidSourceConnection = (connection: Connection) => {
        const edges = getEdges().filter((edge) => edge.source === id);
        if (edges.length >= 1) {
            showErrorOnce('Only one outgoing connection is allowed from the source.', 'source');
            return false;
        }
        return true;
    };

    const isValidConnection = (connection: Connection) => {
        if (connection.target === id && connection.targetHandle === 'input') {
            return isValidTargetConnection(connection);
        }
        if (connection.source === id && connection.sourceHandle === 'source') {
            return isValidSourceConnection(connection);
        }
        return true;
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
                                <span>{type || 'Node type not found'}</span>
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

            {/* Target Handle */}
            <Handle
                type="target"
                position={Position.Left}
                id="input"
                isValidConnection={isValidConnection}
            />

            {/* Source Handle */}
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

export default CompilerNode;
