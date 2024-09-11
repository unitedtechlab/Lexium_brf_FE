import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import { Select } from 'antd';
import 'reactflow/dist/style.css';

const CompilerNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [result, setResult] = useState<number>(0);
    const [operation, setOperation] = useState<string>('min');
    const [inputValues, setInputValues] = useState<number[]>([]);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);
        const values = edges.map((edge) => {
            const sourceNode = getNode(edge.source);
            return sourceNode?.data?.value || sourceNode?.data?.result || 0;
        });

        setInputValues(values);

        let calculatedResult = 0;
        if (operation === 'min') {
            calculatedResult = Math.min(...values);
        } else if (operation === 'max') {
            calculatedResult = Math.max(...values);
        }

        setResult(calculatedResult);

        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, result: calculatedResult, operation } }
                    : node
            )
        );
    }, [getEdges, getNode, id, setNodes, operation]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
    };

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div>Compiler Node</div>
            <div className="nodrag">
                <Select
                    defaultValue="min"
                    style={{ width: 150, marginBottom: '10px' }}
                    onChange={handleOperationChange}
                >
                    <Select.Option value="min">Min Value</Select.Option>
                    <Select.Option value="max">Max Value</Select.Option>
                </Select>
            </div>
            <div>Input Values: {inputValues.join(', ')}</div>
            <div>Result: {result}</div>

            <Handle
                type="target"
                position={Position.Left}
                id="input"
            />

            <Handle
                type="source"
                position={Position.Right}
                id="source"
            />
        </div>
    );
};

export default CompilerNode;
