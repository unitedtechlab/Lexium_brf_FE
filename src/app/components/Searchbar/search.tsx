"use client"

import classes from './search.module.css'
import { BiSearch } from "react-icons/bi";
import { Input } from 'antd';
import { ChangeEvent } from 'react';

type SearchbarProps = {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const Searchbar: React.FC<SearchbarProps> = ({ value, onChange }) => {
    return (
        <Input
            size="large"
            prefix={<BiSearch />}
            placeholder="Search..."
            value={value}
            onChange={onChange}
            className={classes.searchwrapper}
        />
    );
};

export default Searchbar;
