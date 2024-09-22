import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Form, Input, Button, message } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { MdOutlineOutput } from 'react-icons/md';

const OutputNode: React.FC<NodeProps<any>> = ({ id, data, isConnectable }) => {
    const [outputName, setOutputName] = useState<string>(data.outputName || '');

    const handleOutputNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOutputName(e.target.value);
        data.outputName = e.target.value;
    };

    const validateForm = () => {
        if (!outputName.trim()) {
            message.error('Output name is required');
            return false;
        }
        return true;
    };

    const saveWorkflow = () => {
        if (!validateForm()) return;

        const workflowData = {
            outputName,
        };

        data.outputName = outputName;
        console.log('Saving workflow with data:', workflowData);
    };

    const saveAsGlobalVariable = () => {
        if (!validateForm()) return;

        const storedGlobalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
        const newGlobalVariable = {
            outputName,
        };

        const updatedGlobalVariables = Array.isArray(storedGlobalVariables)
            ? [...storedGlobalVariables, newGlobalVariable]
            : [newGlobalVariable];

        localStorage.setItem('GlobalVariables', JSON.stringify(updatedGlobalVariables));
        message.success('Saved as a global variable');
        const event = new Event('globalVariableUpdated');
        window.dispatchEvent(event);
    };

    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: '340px' }}>
                <Form name={`output-form-${id}`} layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <MdOutlineOutput className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || 'Output Node'}</h6>
                                </div>
                            </div>
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

                        <div className={`flex gap-1 ${styles.BtnGroups}`}>
                            <Button type="primary" onClick={saveWorkflow} className="btn">
                                Save Output
                            </Button>
                            <Button type="default" onClick={saveAsGlobalVariable} className="btn btn-outline">
                                Save as Global Variable
                            </Button>
                        </div>

                        <Handle
                            type="target"
                            position={Position.Left}
                            isConnectable={isConnectable}
                        />
                        <Handle
                            type="source"
                            position={Position.Right}
                            isConnectable={isConnectable}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default OutputNode;
