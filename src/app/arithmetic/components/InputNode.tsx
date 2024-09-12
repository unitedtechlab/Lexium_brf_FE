import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Input, Form, Button, Select } from 'antd';
import 'reactflow/dist/style.css';

const InputNode = ({ id, data }: NodeProps<any>) => {
    const [fields, setFields] = useState<any[]>([{ type: 'constant', value: 0 }]);
    const [variables] = useState<string[]>(['Variable 1', 'Variable 2', 'Variable 3']);

    const handleChange = (index: number, value: number) => {
        const newFields = [...fields];
        newFields[index].value = value;
        setFields(newFields);

        data[`value${index + 1}`] = value;
    };

    const handleSelectChange = (index: number, value: string) => {
        const newFields = [...fields];
        newFields[index].selectedVariable = value;
        setFields(newFields);

        data[`variable${index + 1}`] = value;
    };

    const addConstantField = () => {
        setFields([...fields, { type: 'constant', value: 0 }]);
    };

    const addVariableField = () => {
        setFields([...fields, { type: 'variable', selectedVariable: '' }]);
    };

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <h6>Constant Values</h6>
            <Form name="custom-value" layout="vertical">
                {fields.map((field, index) => (
                    <Form.Item key={index} label={`Field ${index + 1}`} className="nodrag">
                        {field.type === 'constant' ? (
                            <Input
                                type="number"
                                value={field.value}
                                onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                                placeholder="Constant Value"
                                className="nodrag"
                            />
                        ) : (
                            <Select
                                placeholder="Select Variable"
                                value={field.selectedVariable}
                                onChange={(value) => handleSelectChange(index, value)}
                                className="nodrag"
                            >
                                {variables.map((variable) => (
                                    <Select.Option key={variable} value={variable}>
                                        {variable}
                                    </Select.Option>
                                ))}
                            </Select>
                        )}
                    </Form.Item>
                ))}
                <Button onClick={addConstantField} style={{ marginRight: '10px' }}>
                    Add Constant
                </Button>
                <Button onClick={addVariableField}>
                    Add Variable
                </Button>
            </Form>
            <Handle type="source" position={Position.Right} />
        </div>
    );
};

export default InputNode;
