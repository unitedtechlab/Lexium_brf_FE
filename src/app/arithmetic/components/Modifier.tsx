import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Connection, Edge } from 'reactflow';
import { Select } from 'antd';
import 'reactflow/dist/style.css';

const ModifierNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [result, setResult] = useState<number | string>(0);
    const [operation, setOperation] = useState<string>('absolute');
    const [inputValue, setInputValue] = useState<number>(0);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);
        let value = 0;

        if (edges.length > 0) {
            const edge = edges[0]; // Only one target connection allowed
            const sourceNode = getNode(edge.source);
            const sourceValue = sourceNode?.data?.value || sourceNode?.data?.result || 0;
            value = sourceValue;
        }

        setInputValue(value);

        let modifiedResult: number | string = 0;
        if (operation === 'absolute') {
            modifiedResult = Math.abs(value); // Absolute value
        } else if (operation === 'round') {
            modifiedResult = Math.round(value); // Rounded value
        }

        setResult(modifiedResult);

        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? { ...node, data: { ...node.data, result: modifiedResult, operation } }
                    : node
            )
        );
    }, [getEdges, getNode, id, setNodes, operation]);

    const handleOperationChange = (value: string) => {
        setOperation(value);
    };

    const isValidConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.target === id);
        return edges.length === 0; // Only allow one connection to the target
    };

    const isValidSourceConnection = (connection: Connection | Edge) => {
        const edges = getEdges().filter((edge) => edge.source === id);
        return edges.length === 0; // Only allow one connection from the source
    };

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div>Modifier Node</div>
            <div className="nodrag">
                <Select
                    defaultValue="absolute"
                    style={{ width: 150, marginBottom: '10px' }}
                    onChange={handleOperationChange}
                >
                    <Select.Option value="absolute">Absolute Value</Select.Option>
                    <Select.Option value="round">Round Value</Select.Option>
                </Select>
            </div>
            <div>Input Value: {inputValue}</div>
            <div>Result: {result}</div>

            <Handle
                type="target"
                position={Position.Left}
                id="input"
                isValidConnection={isValidConnection}
            />

            <Handle
                type="source"
                position={Position.Right}
                id="source"
                isValidConnection={isValidSourceConnection}
            />
        </div>
    );
};

export default ModifierNode;
