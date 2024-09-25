import React, { useState } from 'react';
import { Handle, NodeProps, Position, useReactFlow } from 'reactflow';
import { Form, Input, Dropdown, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { MdOutlineOutput } from 'react-icons/md';
import { BsThreeDots } from "react-icons/bs";
import SaveGlobalVariableModal from '../modals/GlobalVariableModal';

const getConnectedNode = (nodeId: string, allEdges: any[], allNodes: any[]) => {
    const connectedEdges = allEdges.filter(edge => edge.source === nodeId);

    if (connectedEdges.length === 0) {
        return nodeId;
    }

    const targetNodeId = connectedEdges[0].target;
    return getConnectedNode(targetNodeId, allEdges, allNodes);
};

const EndNode: React.FC<NodeProps<any>> = ({ id, data, isConnectable }) => {
    const [outputName, setOutputName] = useState<string>(data.outputName || '');
    const { getEdges, getNodes, setNodes } = useReactFlow();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleOutputNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOutputName(e.target.value);
        data.outputName = e.target.value;
    };

    const handleSaveAsGlobalVariable = (globalVariableName: string) => {
        if (!globalVariableName) {
            message.error("Please enter a variable name.");
            return;
        }

        const allEdges = getEdges();
        const allNodes = getNodes();

        const lastConnectedNodeId = getConnectedNode(id, allEdges, allNodes);

        const globalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        const newGlobalVariable = {
            GlobalVariableName: globalVariableName,
            type: 'end_node',
            nodeID: lastConnectedNodeId,
            value: outputName
        };

        const existingIndex = globalVariables.findIndex((v: any) => v.GlobalVariableName === globalVariableName);
        if (existingIndex !== -1) {
            globalVariables[existingIndex] = newGlobalVariable;
        } else {
            globalVariables.push(newGlobalVariable);
        }

        // Save to localStorage
        localStorage.setItem('GlobalVariables', JSON.stringify(globalVariables));
        message.success('Global variable saved successfully.');

        const event = new Event('globalVariableUpdated');
        window.dispatchEvent(event);

        setIsModalVisible(false);
    };

    const handleDeleteNode = () => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
        message.success("Node deleted successfully!");
    };

    const openGlobalVariableModal = () => {
        setIsModalVisible(true);
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        },
        {
            label: 'Save as a Global variable',
            key: '1',
            onClick: openGlobalVariableModal
        }
    ];

    return (
        <div>
            <div className={`${styles['nodeBox']} ${styles.endnode}`} style={{ maxWidth: '340px' }}>
                <Form name={`output-form-${id}`} layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <MdOutlineOutput className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || 'Output Node'}</h6>
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

                        <div className={`flex gap-1 ${styles.formInput}`}>
                            <Form.Item
                                className={`nodrag ${styles.widthInput} ${styles.fullwidth}`}
                                rules={[{ required: true, message: 'Output name is required' }]}
                            >
                                <Input
                                    placeholder="Enter Output Name"
                                    value={outputName}
                                    onChange={handleOutputNameChange}
                                    className={styles.inputField}
                                />
                            </Form.Item>
                        </div>

                        <Handle
                            type="target"
                            position={Position.Left}
                            isConnectable={isConnectable}
                        />
                    </div>
                </Form>

                <SaveGlobalVariableModal
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    onSave={handleSaveAsGlobalVariable}
                />
            </div>
        </div>
    );
};

export default EndNode;
