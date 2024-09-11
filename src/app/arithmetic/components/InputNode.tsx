import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const InputNode = ({ id, data }: NodeProps<any>) => {
    const [value, setValue] = useState<number>(0);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(event.target.value);
        setValue(newValue);
        data.value = newValue;
        console.log("newValue", newValue)
    };

    return (
        <div style={{ padding: '10px', border: '1px solid black', borderRadius: '5px' }}>
            <div>Input Node {id}</div>
            <input type="number" value={value} onChange={handleChange} />
            <Handle type="source" position={Position.Right} />
        </div>
    );
};

export default InputNode;
