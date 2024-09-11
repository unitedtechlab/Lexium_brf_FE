import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';

const OutputNode = ({ id }: NodeProps<any>) => {
    const { getEdges, getNode } = useReactFlow();
    const [output, setOutput] = useState(0);

    useEffect(() => {
        const edges = getEdges().filter((edge) => edge.target === id);

        if (edges.length > 0) {
            const sourceNode = getNode(edges[0].source); // The source is the AdditionSubNode
            setOutput(sourceNode?.data?.result || 0); // Fetch the result from the AdditionSubNode
        }
    }, [getEdges, getNode, id]);

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div>Result Node</div>
            <div>Result: {output}</div> {/* Display the output from the AdditionSubNode */}
            <Handle type="target" position={Position.Left} />
        </div>
    );
};

export default OutputNode;
