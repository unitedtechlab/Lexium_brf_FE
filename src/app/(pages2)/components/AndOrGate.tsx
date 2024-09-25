import { Handle, NodeProps, Position } from "reactflow";
import styles from '@/app/assets/css/workflow.module.css';
import { Form, Input, Select } from "antd";
import { MdOutlineSelectAll } from "react-icons/md";
import { useState } from "react";
const { Option } = Select;

const ANDORGateNode = ({ id, data, type }: NodeProps<any>) => {
    const [selectedGate, setSelectedGate] = useState<string | null>(null);

    const handleSelectChange = (value: string, type:'gate') => {
         if (type === 'gate') {
            setSelectedGate(value);
        }
    };
    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: "340px" }}>
                <Form name="gate-node" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <MdOutlineSelectAll className={styles.iconFlag} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "AND/OR Gate"}</h6>
                                    <span>Type: {"valueType"}</span>
                                </div>
                            </div>
                        </div>
                        <div className={`flex gap-1 ${styles.formInput}`}>
                            <Form.Item className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}>
                                <Select
                                    className={`nodrag ${styles.inputField}`}
                                    placeholder="Select Gate"
                                    value={selectedGate}
                                    onChange={(value) => handleSelectChange(value, 'gate')}
                                >
                                    <Option value="and">AND</Option>
                                    <Option value="or">OR</Option>
                                </Select>
                            </Form.Item>
                        </div>
                        <Handle type="target"
                            position={Position.Left}
                            style={{ background: 'red' }} />
                        <Handle type="source"
                            position={Position.Right}
                            style={{ background: 'red'}} />
                    </div>
                </Form>
            </div>
        </div>
    );
}
export default ANDORGateNode;