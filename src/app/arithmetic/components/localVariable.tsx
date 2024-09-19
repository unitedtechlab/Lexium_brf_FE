import React, { useState, useEffect } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Form, Select } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import { MdOutlineSelectAll } from 'react-icons/md';

const { Option } = Select;

const LocalVariableNode = ({ id, data, type }: NodeProps<any>) => {
    const [localVariables, setLocalVariables] = useState<any[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(data.selectedVariable || null);
    const [variableValue, setVariableValue] = useState<string>(data.value || '');
    const [valueType, setValueType] = useState<string | null>(data.variableType || null);

    useEffect(() => {
        const storedVariables = JSON.parse(localStorage.getItem('localVariables') || '[]');
        setLocalVariables(storedVariables);
    }, []);

    const handleSelectChange = (value: string) => {
        setSelectedVariable(value);
        const foundVariable = localVariables.find(variable => variable.name === value);
        if (foundVariable) {
            setVariableValue(foundVariable.value || '');
            setValueType(foundVariable.type || 'number');
        }

        // Update node data to store the selected variable details
        data.selectedVariable = foundVariable?.name;
        data.value = foundVariable?.value;
        data.variableType = foundVariable?.type;
    };

    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: "340px" }}>
                <Form name="local-variable" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <MdOutlineSelectAll className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Local Variable"}</h6>
                                    {valueType && (
                                        <span>Type: {valueType}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`flex gap-1 ${styles.formInput}`}>
                            <Form.Item className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}>
                                <Select
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Select a Variable"
                                    onChange={handleSelectChange}
                                    value={selectedVariable}
                                >
                                    {localVariables.map((variable, index) => (
                                        <Option key={index} value={variable.name}>
                                            {variable.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>

                        {/* Add both source and target handles */}
                        <Handle
                            type="target"
                            position={Position.Left}
                            style={{ background: 'red' }}
                        />
                        <Handle
                            type="source"
                            position={Position.Right}
                            style={{ background: 'red' }}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default LocalVariableNode;
