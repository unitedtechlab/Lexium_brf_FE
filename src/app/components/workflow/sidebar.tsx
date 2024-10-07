import React, { useState } from 'react';
import styles from '@/app/assets/css/workflow.module.css';
import { MdOutlineFilterAlt, MdOutlineSelectAll, MdOutlinePivotTableChart, MdOutlineJoinInner, MdOutlineScreenSearchDesktop } from 'react-icons/md';
import { FaSortAlphaDown, FaProjectDiagram } from 'react-icons/fa';
import { TbMathSymbols } from "react-icons/tb";
import { VscGroupByRefType } from 'react-icons/vsc';
import { PiChartLineUp } from "react-icons/pi";
import { SiTimescale } from "react-icons/si";
import { AiOutlineTable } from "react-icons/ai";
import { Collapse, Input, Select } from 'antd';

const { Panel } = Collapse;
const { Search } = Input;

const iconComponents = {
    FaSortAlphaDown,
    FaProjectDiagram,
    MdOutlineFilterAlt,
    MdOutlineSelectAll,
    VscGroupByRefType,
    MdOutlinePivotTableChart,
    TbMathSymbols,
    PiChartLineUp,
    SiTimescale,
    MdOutlineScreenSearchDesktop,
    MdOutlineJoinInner,
    AiOutlineTable
};

type IconName = keyof typeof iconComponents;

interface SidebarItem {
    id: string;
    icon: IconName;
    title: string;
    description: string;
    enabled: boolean;
}

interface SidebarProps {
    workspaces: any[];
    selectedWorkspace: string | null;
    setSelectedWorkspace: (workspaceId: string | null) => void;
    sidebarItems: SidebarItem[];
}

const handleDragStart = (e: React.DragEvent, item: SidebarItem) => {
    if (!item.enabled) return;
    const itemData = {
        id: item.id,
        icon: item.icon,
        title: item.title,
        description: item.description
    };
    e.dataTransfer.setData('application/json', JSON.stringify(itemData));
};

const renderSidebarItems = (items: SidebarItem[]) => {
    return items.map(item => {
        const IconComponent = iconComponents[item.icon];
        const itemClassName = item.enabled ? styles.sidebardragDrop : styles.sidebardragDropDisabled;
        return (
            <div
                key={item.id}
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                draggable={item.enabled}
                onDragStart={(e) => handleDragStart(e, item)}
            >
                <IconComponent className={styles.icon} />
                <h6 className={styles.titleName}>{item.title}</h6>
            </div>
        );
    });
};

const SideBar: React.FC<SidebarProps> = ({ workspaces = [], selectedWorkspace, setSelectedWorkspace, sidebarItems }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeKey, setActiveKey] = useState<string[]>([]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value === '') {
            setActiveKey([]);
            return;
        }

        const lowerCaseValue = value.toLowerCase();
        const panelKeys: string[] = [];

        if (sidebarItems.slice(0, 3).some(item => item.title.toLowerCase().includes(lowerCaseValue))) {
            panelKeys.push("1");
        }
        if (sidebarItems.slice(3, 4).some(item => item.title.toLowerCase().includes(lowerCaseValue))) {
            panelKeys.push("2");
        }
        if (sidebarItems.slice(4, 9).some(item => item.title.toLowerCase().includes(lowerCaseValue))) {
            panelKeys.push("3");
        }
        if (sidebarItems.slice(9).some(item => item.title.toLowerCase().includes(lowerCaseValue))) {
            panelKeys.push("4");
        }
        setActiveKey(panelKeys);
    };

    const handleWorkspaceChange = (value: string) => {
        setSelectedWorkspace(value);
    };

    return (
        <div className={styles.sidebarWrapper}>
            <div className={styles.heading}>
                <h6>Tool Box</h6>
                <p>Click and drag a block to canvas to build a workflow</p>
            </div>
            <div className={styles.workspaceSelect}>
                <label htmlFor="selectworkspace">Select Workspace</label>
                <Select
                    placeholder="Select Workspace"
                    value={selectedWorkspace}
                    onChange={handleWorkspaceChange}
                    className='workspace_select'
                    id='selectworkspace'
                >
                    {workspaces.map((workspace) => (
                        <Select.Option key={workspace.id} value={workspace.id}>
                            {workspace.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            <div className={styles.searchWrapper}>
                <Search
                    placeholder="Search"
                    onChange={handleSearchChange}
                    value={searchTerm}
                    className={styles['searchInput']}
                />
            </div>
            <Collapse accordion={false} activeKey={activeKey} onChange={(key) => setActiveKey(Array.isArray(key) ? key : [key])} className='accordian'>
                <Panel header="Basic Operators" key="1">
                    <div className={styles['ant-collapse-content']}>
                        {renderSidebarItems(sidebarItems.slice(0, 3))}
                    </div>
                </Panel>
                <Panel header="Conditional Operators" key="2">
                    <div className={styles['ant-collapse-content']}>
                        {renderSidebarItems(sidebarItems.slice(3, 4))}
                    </div>
                </Panel>
                <Panel header="Data Transformation" key="3">
                    <div className={styles['ant-collapse-content']}>
                        {renderSidebarItems(sidebarItems.slice(4, 9))}
                    </div>
                </Panel>
                <Panel header="Other Tools" key="4">
                    <div className={styles['ant-collapse-content']}>
                        {renderSidebarItems(sidebarItems.slice(9))}
                    </div>
                </Panel>
            </Collapse>
        </div>
    );
};

export default SideBar;
