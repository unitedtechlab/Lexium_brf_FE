"use client";

import React, { useState, useEffect } from 'react';
import { Button, message, Empty, Dropdown } from 'antd';
import Link from 'next/link';
import { BiDotsVerticalRounded } from 'react-icons/bi';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Searchbar from '../../components/Searchbar/search';
import View from '../../components/GridListView/view';
import { useEmail } from '@/app/context/emailContext';
import classes from '@/app/assets/css/pages.module.css';
import wireframe from '../../assets/images/wireframe.svg';
import Loader from '@/app/loading';
import { fetchWorkspaces } from '@/app/API/api';
import { Workspace } from '@/app/types/interface';


export default function WorkflowList() {
    const [searchInput, setSearchInput] = useState('');
    const { email } = useEmail();

    const items = [
        {
            label: 'Delete',
            key: 'delete',
        },
    ];

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    return (
        <div className={classes.dashboardWrapper}>
            <div className={classes.heading}>
                <h1>WorkFlow Management</h1>
            </div>
            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                <div className="flex gap-1">
                    <View />
                    <Link href="/workflow" className='btn'>Create WorkFlow</Link>
                </div>
            </div>

            <div className={`${classes.workspaceCreate} flex gap-2`}>
                <div className={`${classes.workspacebox}`}>
                    <div className={`flex gap-1 alinc ${classes.link}`}>
                        <Link href={`/create-folder`}>
                            <div className={`${classes.workspaceName} flex gap-1`}>
                                <Image src={wireframe} alt="Folder Icon" width={32} height={32} />
                                <p>
                                    <b>WorkFlow Name</b>
                                </p>
                            </div>
                        </Link>
                        <div className={`${classes.storage} flex gap-1 alinc`}>
                            <p className={classes.storageValue}>
                                <span>fileSize</span>
                                <b>lastUpdated</b>
                            </p>
                            <div className={classes.dropdownWorkspace}>
                                <Dropdown menu={{ items }} trigger={['click']}>
                                    <Button
                                        className={classes.btnBlank}
                                    >
                                        <BiDotsVerticalRounded />
                                    </Button>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`${classes.workspacebox}`}>
                    <div className={`flex gap-1 alinc ${classes.link}`}>
                        <Link href={`/create-folder`}>
                            <div className={`${classes.workspaceName} flex gap-1`}>
                                <Image src={wireframe} alt="Folder Icon" width={32} height={32} />
                                <p>
                                    <b>ADP</b>
                                </p>
                            </div>
                        </Link>
                        <div className={`${classes.storage} flex gap-1 alinc`}>
                            <p className={classes.storageValue}>
                                <span>fileSize</span>
                                <b>lastUpdated</b>
                            </p>
                            <div className={classes.dropdownWorkspace}>
                                <Dropdown menu={{ items }} trigger={['click']}>
                                    <Button
                                        className={classes.btnBlank}
                                    >
                                        <BiDotsVerticalRounded />
                                    </Button>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
