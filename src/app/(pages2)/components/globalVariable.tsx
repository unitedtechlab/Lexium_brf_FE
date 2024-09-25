import { Handle, NodeProps, Position, useReactFlow } from "reactflow";
import { useEffect, useState } from "react";
import styles from '@/app/assets/css/workflow.module.css';
import { Form, Select, Dropdown, message } from "antd";
import { AiOutlineGlobal } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";

const { Option } = Select;

const GlobalVariableNode = ({ id, data, type }: NodeProps<any>) => {
    const { setNodes } = useReactFlow();
    const [globalVariables, setGlobalVariables] = useState<any[]>([]);
    const [selectedVariable, setSelectedVariable] = useState<string | null>(data.selectedVariable || null);
    const [variableValue, setVariableValue] = useState<string>(data.value || '');
    const [variableType, setVariableType] = useState<string | null>(data.variableType || 'unknown');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updatedGlobalVariables = JSON.parse(localStorage.getItem('GlobalVariables') || '[]');
            setGlobalVariables(updatedGlobalVariables);
        }
    }, []);

    const handleSelectChange = (value: string) => {
        setSelectedVariable(value);
        const foundVariable = globalVariables.find(variable => variable.GlobalVariableName === value);
        if (foundVariable) {
            setVariableValue(foundVariable.value || '');
            setVariableType(foundVariable.variableType || 'unknown');
        }

        data.selectedVariable = foundVariable?.GlobalVariableName;
        data.value = foundVariable?.value;
        data.variableType = foundVariable?.variableType || 'unknown';
    };

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        message.success('Node deleted successfully');
    };

    const menuItems = [
        {
            label: 'Delete Node',
            key: '0',
            onClick: handleDeleteNode
        }
    ];

    return (
        <div>
            <div className={`${styles['nodeBox']} ${styles.globalVariable}`} style={{ maxWidth: "340px" }}>
                <Form name="global-variable" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <AiOutlineGlobal className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Global Variable"}</h6>
                                    {variableType && (
                                        <span>Type: {variableType || 'unknown'}</span>
                                    )}
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
                            <Form.Item className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}>
                                <Select
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Select a Variable"
                                    onChange={handleSelectChange}
                                    value={selectedVariable}
                                >
                                    {globalVariables.map((variable, index) => (
                                        <Option key={index} value={variable.GlobalVariableName}>
                                            {variable.GlobalVariableName}
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
    );
};

export default GlobalVariableNode;
