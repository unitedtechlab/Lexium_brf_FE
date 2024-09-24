import { Handle, NodeProps, Position } from "reactflow";
import { useEffect, useState } from "react";
import styles from '@/app/assets/css/workflow.module.css';
import { Form, Input, Select } from "antd";
import { AiOutlineGlobal } from "react-icons/ai";
const { Option } = Select;
const GobalVariableNode = ({ id, data, type }: NodeProps<any>) => {
    const [globalVariables, setGlobalVariables] = useState<any[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(data.selectedVariable || null);
    const [variableValue, setVariableValue] = useState<string>(data.value || '');
    const [valueType, setValueType] = useState<string | null>(data.variableType || null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updatedGlobalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
            setGlobalVariables(updatedGlobalVariables);
        }
    }, []);

    const handleSelectChange = (value: string) => {
        setSelectedVariable(value);
        const foundVariable = globalVariables.find(variable => variable.name === value);
        if (foundVariable) {
            setVariableValue(foundVariable.value || '');
            setValueType(foundVariable.type || 'number');
        }
        data.selectedVariable = foundVariable?.outputName;
        data.value = foundVariable?.value;
        data.variableType = foundVariable?.type;
    };

    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: "340px" }}>
                <Form name="global-variable" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <AiOutlineGlobal className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Global Variable"}</h6>
                                    {valueType && (
                                        <span>Type: {valueType}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={`flex gap-1 ${styles.formInput}`}>
                            <Form.Item className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}>
                                <Select className={`nodrag ${styles.inputField}`} placeholder="Select a Variable" onChange={handleSelectChange} value={selectedVariable}>
                                    {globalVariables.map((variable, index) => (
                                        <Option key={index} value={variable.outputName}>
                                            {variable.outputName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </div>
                        <Handle
                            type="target"
                            position={Position.Left}
                        />
                        <Handle
                            type="source"
                            position={Position.Right}
                        />
                    </div>
                </Form>
            </div>
        </div>
    )
}
export default GobalVariableNode;
