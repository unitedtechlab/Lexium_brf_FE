import React from 'react';
import { useDnD } from './DnDContext';
import styles from '@/app/assets/css/workflow.module.css';
import { Input, Select } from 'antd';
import { MdOutlineInput, MdOutlineAddCircle, MdOutlineOutput } from 'react-icons/md';

const { Search } = Input;

const Sidebar: React.FC = () => {
  const { setType } = useDnD();

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const IconComponent = ({ icon }: { icon: React.ReactElement }) => {
    return <span className={styles.icon}>{icon}</span>;
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
          >
            <Select.Option>Workspace 1</Select.Option>
          </Select>
        </div>

        <div className={styles.searchWrapper}>
          <Search placeholder="Search" className={styles.searchInput} />
        </div>

        <div className={styles.operations}>
          <h6>Arithmetic Operators</h6>
          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'inputNode')}
            draggable
          >
            <IconComponent icon={<MdOutlineInput />} />
            <h6 className={styles.titleName}>Input Node</h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'additionSubNode')}
            draggable
          >
            <IconComponent icon={<MdOutlineAddCircle />} />
            <h6 className={styles.titleName}>Addition / Subtraction</h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'divMulNode')}
            draggable
          >
            <IconComponent icon={<MdOutlineAddCircle />} />
            <h6 className={styles.titleName}>Division / Multiplication</h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'modifierNode ')}
            draggable
          >
            <IconComponent icon={<MdOutlineAddCircle />} />
            <h6 className={styles.titleName}>Modifier </h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'compilerNode')}
            draggable
          >
            <IconComponent icon={<MdOutlineAddCircle />} />
            <h6 className={styles.titleName}>Compiler</h6>
          </div>

          <div
            className={`flex gap-1 ${styles.sidebardragDrop}`}
            onDragStart={(event) => onDragStart(event, 'outputNode')}
            draggable
          >
            <IconComponent icon={<MdOutlineOutput />} />
            <h6 className={styles.titleName}>Output</h6>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
