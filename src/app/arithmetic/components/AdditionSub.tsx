import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';

const AdditionSubNode = ({ id, data }: NodeProps<any>) => {
    const { getEdges, getNode, setNodes } = useReactFlow();
    const [result, setResult] = useState(0);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        const connectedValues = edges.map((edge) => {
            const sourceNode = getNode(edge.source);
            return sourceNode?.data?.value || 0; // Fetch the value from connected input nodes
        });

        const calculatedResult = connectedValues.reduce((acc, val) => acc + val, 0); // Sum values
        setResult(calculatedResult);
        console.log("calculatedResult", calculatedResult)

        // Update node data to reflect the new result
        setNodes((nodes) =>
            nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, result: calculatedResult } } : node)
        );
    }, [getEdges, getNode, id, setNodes]);

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div>Add / Subtract Node</div>
            <div>Result: {result}</div> {/* Display the calculated result */}
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
};

export default AdditionSubNode;
