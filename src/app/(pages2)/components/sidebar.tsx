"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Select, Input, message } from 'antd';
import { useDnD } from './DnDContext';
import styles from '@/app/assets/css/workflow.module.css';
import { fetchWorkspaces, fetchFolders, fetchFolderData } from '@/app/API/api';
import { useEmail } from '@/app/context/emailContext';
import { PiMathOperationsBold } from "react-icons/pi";
import { TbMathXDivideY2, TbMathIntegralX, TbMathMaxMin } from "react-icons/tb";
import { MdOutlineSelectAll, MdOutlineOutput, MdOutlineAccountTree } from "react-icons/md";
import { AiOutlineNumber, AiOutlineGlobal } from "react-icons/ai";
import { GiLogicGateNand } from "react-icons/gi";
import { SiLocal } from "react-icons/si";
import { usePathname } from 'next/navigation';

const { Search } = Input;

export const IconComponent: React.FC<{ icon: React.ReactElement }> = ({ icon }) => {
  return <span className={styles.icon}>{icon}</span>;
};

const Sidebar: React.FC<{ setFolderData: (data: any[]) => void }> = ({ setFolderData }) => {
  const { email } = useEmail();
  const { setType } = useDnD();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const pathname = usePathname();

  const loadWorkspaces = useCallback(async () => {
    if (email) {
      setLoading(true);
      try {
        const workspacesData = await fetchWorkspaces(email, setLoading);
        const cleanDataWorkspaces = workspacesData.filter(workspace => workspace.cleanDataExist);
        setWorkspaces(cleanDataWorkspaces);
      } catch (error) {
        message.error('Failed to fetch workspaces.');
        console.error("Failed to fetch workspaces:", error);
      } finally {
        setLoading(false);
      }
    } else {
      message.error('Email is required to fetch workspaces.');
    }
  }, [email]);

  const loadFolders = useCallback(async (workspaceId: string) => {
    if (email) {
      setLoading(true);
      try {
        const foldersData = await fetchFolders(email, workspaceId, setLoading);
        setFolders(foldersData);
      } catch (error) {
        message.error('Failed to fetch folders.');
        console.error("Failed to fetch folders:", error);
      } finally {
        setLoading(false);
      }
    } else {
      message.error('Email is required to fetch folders.');
    }
  }, [email]);

  const loadColumns = useCallback(async (folderId: string) => {
    if (email && selectedWorkspace) {
      setLoading(true);
      try {
        const folderData = await fetchFolderData(email, selectedWorkspace, folderId);
        setFolderData(folderData);
        const fetchedColumns = Object.keys(folderData);
        setColumns(fetchedColumns);
      } catch (error) {
        message.error('Failed to fetch columns.');
        console.error("Failed to fetch columns:", error);
      } finally {
        setLoading(false);
      }
    } else {
      message.error('Email and Workspace are required to fetch columns.');
    }
  }, [selectedWorkspace, email]);

  useEffect(() => {
    if (email) {
      loadWorkspaces();
    }
  }, [email, loadWorkspaces]);

  const handleWorkspaceChange = (value: string) => {
    setSelectedWorkspace(value);
    loadFolders(value);
  };

  const handleFolderChange = (value: string) => {
    setSelectedFolder(value);
    loadColumns(value);
  };

  const isDragDisabled = !selectedWorkspace || !selectedFolder;

  const onDragStart = (event: React.DragEvent, nodeType: string, titleName: string) => {
    if (isDragDisabled) {
      event.preventDefault();
      message.error('Please select a Workspace and Table before dragging a node.');
      return;
    }
    setType({ nodeType, titleName });
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className={styles.sidebarWrapper}>
        <div className={styles.heading}>
          <h6>Tool Box</h6>
          <p>Click and drag a block to canvas to build a workflow</p>
        </div>

        <div className={styles.workspaceSelect}>
          <label htmlFor="selectworkspace">Select Workspace</label>
          <Select
            placeholder="Select Workspace"
            className="workspace_select"
            id="selectworkspace"
            value={selectedWorkspace}
            onChange={handleWorkspaceChange}
            loading={loading}
          >
            {workspaces.map((workspace) => (
              <Select.Option key={workspace.id} value={workspace.id}>
                {workspace.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.workspaceSelect}>
          <label htmlFor="selectfolder">Select Table</label>
          <Select
            placeholder="Select Table"
            className="workspace_select"
            id="selectfolder"
            value={selectedFolder}
            onChange={handleFolderChange}
            loading={loading}
          >
            {folders.map((folder) => (
              <Select.Option key={folder.id} value={folder.id}>
                {folder.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div className={styles.searchWrapper}>
          <Search placeholder="Search" className={styles.searchInput} />
        </div>

        <div className={styles.operations}>
          {pathname === '/arithmetic' && (
            <>
              <h6>Arithmetic Operators</h6>
              <div
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                onDragStart={(event) => onDragStart(event, 'add_sub_type', 'Addition / Subtraction')}
                draggable
              >
                <IconComponent icon={<PiMathOperationsBold />} />
                <h6 className={styles.titleName}>Addition / Subtraction</h6>
              </div>

              <div
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                onDragStart={(event) => onDragStart(event, 'multiply_divide_type', 'Multiplication / Division')}
                draggable
              >
                <IconComponent icon={<TbMathXDivideY2 />} />
                <h6 className={styles.titleName}>Multiplication / Division</h6>
              </div>

              <div
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                onDragStart={(event) => onDragStart(event, 'modifier_type', 'Modifier')}
                draggable
              >
                <IconComponent icon={<TbMathIntegralX />} />
                <h6 className={styles.titleName}>Modifier</h6>
              </div>
            </>
          )}

          {pathname === '/conditional' && (
            <>
              <h6>Conditional Operators</h6>
              <div
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                onDragStart={(event) => onDragStart(event, 'conditional', 'Comparator')}
                draggable
              >
                <IconComponent icon={<MdOutlineAccountTree />} />
                <h6 className={styles.titleName}>Comparator</h6>
              </div>

              <div
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                onDragStart={(event) => onDragStart(event, 'gates', 'Gate operator')}
                draggable
              >
                <IconComponent icon={<GiLogicGateNand />} />
                <h6 className={styles.titleName}>Gate operator</h6>
              </div>
            </>
          )}

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'variables', 'Variables')}
            draggable
          >
            <IconComponent icon={<MdOutlineSelectAll />} />
            <h6 className={styles.titleName}>Variables</h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'constant', 'Constant')}
            draggable
          >
            <IconComponent icon={<AiOutlineNumber />} />
            <h6>Constant</h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'compiler_type', 'Compiler')}
            draggable
          >
            <IconComponent icon={<TbMathMaxMin />} />
            <h6 className={styles.titleName}>Compiler</h6>
          </div>

          {/* Local Variable Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'local_variable', 'Local Variable')}
            draggable
          >
            <IconComponent icon={<SiLocal />} />
            <h6>Local Variable</h6>
          </div>

          {/* Global Variable Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'global_variable', 'Global Variable')}
            draggable
          >
            <IconComponent icon={<AiOutlineGlobal />} />
            <h6>Global Variable</h6>
          </div>

          {/* End Node */}
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'end_node', 'End Node')}
            draggable
          >
            <IconComponent icon={<MdOutlineOutput />} />
            <h6>End Node</h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'compiler_type', 'Compiler')}
            draggable
          >
            <IconComponent icon={<TbMathMaxMin />} />
            <h6 className={styles.titleName}>Compiler</h6>
          </div>
          {pathname === '/arithmetic' && (
            <>
              {/* Output Node */}
              <div
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                onDragStart={(event) => onDragStart(event, 'output_node', 'Output Node')}
                draggable
              >
                <IconComponent icon={<MdOutlineOutput />} />
                <h6>Output Node</h6>
              </div>
            </>
          )}
          {pathname === '/conditional' && (
            <>
              {/* Gate Node */}
              <div
                className={`flex gap-1 ${styles.sidebardragDrop}`}
                onDragStart={(event) => onDragStart(event, 'gate_node', 'Gate Node')}
                draggable
              >
                <IconComponent icon={<GiLogicGateNand />} />
                <h6>Gate (AND/OR)</h6>
              </div>
            </>
          )}

        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
