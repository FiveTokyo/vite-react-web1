import React, { useContext } from 'react';
import { Button, Drawer, Space, Switch, Tooltip } from 'antd';
import { CSS } from '@dnd-kit/utilities';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { MenuOutlined, SettingFilled } from '@ant-design/icons';
import { useState, memo } from 'react';
import { cloneDeep, differenceBy } from 'lodash-es';
import { JMTableContext } from '..';


const TableSetting = memo((props) => {
  const p = useContext(JMTableContext);
  const value = p.settingCols || [];
  const source = p.colMemo || [];
  const saveKey = p.saveKey ? `${p.saveKey}_columns_setting` : null;

  const local_columns_setting = localStorage.getItem(saveKey);
  const [visible, setVisible] = React.useState(false);
  const [data, setData] = React.useState(() => {
    if (local_columns_setting && saveKey) {
      let s = [];
      let v = JSON.parse(local_columns_setting);
      const result = cloneDeep(source);
      //插入后续新增字段
      const diff = differenceBy(result, v, 'dataIndex');
      if (diff?.length > 0) {
        diff.forEach((d) => {
          const index = result.findIndex((k) => k.dataIndex === d.dataIndex);
          d.hidden = true;
          v.splice(index, 0, d);
        });
      }
      v.forEach((d) => {
        const item = result.find((k) => k?.dataIndex === d?.dataIndex);
        if (item) {
          item.hidden = d.hidden;
          s.push(item);
        }
      });
      return s;
    }
    return source;
  });

  const [isSetting, setIsSetting] = useState(() => {
    return saveKey && !!local_columns_setting;
  });

  function dragEndEvent(props) {
    const { active, over } = props;
    const activeIndex = data.findIndex((d) => d.dataIndex == active.id);
    const overIndex = data.findIndex((d) => d.dataIndex == over.id);
    setData(arrayMove(data, activeIndex, overIndex));
  }

  function onChange(index) {
    const newData = cloneDeep(data);
    newData[index].hidden = !newData[index]?.hidden;
    setData(newData);
  }

  function save() {
    setVisible(false);

    const result = data?.map((d) => ({
      dataIndex: d.dataIndex,
      hidden: d.hidden,
    }));
    props.onConfire?.(result);

    let flag = result.some((d) => d.hidden);

    if (!flag) {
      for (let index = 0; index < source.length; index++) {
        const element = source[index];
        if (result[index] && element.dataIndex !== result[index].dataIndex) {
          flag = true;
          break;
        }
      }
    }

    if (saveKey) {
      if (flag === false) {
        localStorage.removeItem(saveKey);
      } else {
        localStorage.setItem(saveKey, JSON.stringify(result));
      }
    }
    setIsSetting(flag);
  }

  function cancel() {
    setVisible(false);
    if (value.length > 0) {
      let s = [];
      const result = cloneDeep(source);
      value.forEach((d) => {
        const item = result.find((k) => k.dataIndex === d.dataIndex);
        item.hidden = d.hidden;
        s.push(item);
      });
      setData(s);
    }
  }

  return (
    <React.Fragment>
      <Tooltip title="列表字段显示/隐藏，排列顺序" placement="bottom">
        <Button
          type="link"
          icon={<SettingFilled />}
          style={{ fontSize: 16, color: isSetting ? '#1890FF' : '#999' }}
          onClick={() => setVisible(true)}
        />
      </Tooltip>

      <Drawer
        title="列设置"
        placement="right"
        closable={false}
        destroyOnClose={true}
        open={visible}
        width={400}
        onClose={() => cancel()}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => cancel()}>取消</Button>
            <Button
              onClick={() => {
                setData(source);
              }}
            >
              还原
            </Button>
            <Button type="primary" onClick={() => save()}>
              保存
            </Button>
          </Space>
        }
      >
        <DndContext onDragEnd={dragEndEvent}>
          <SortableContext items={data.map((d) => d.dataIndex)}>
            {data?.map((item, index) => {
              return (
                <TableSortableItem
                  key={item.dataIndex}
                  id={item.dataIndex}
                  item={item}
                  onChange={() => onChange(index)}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </Drawer>
    </React.Fragment>
  );
});

const TableSortableItem = (props) => {
  const { item, onChange, id } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const content = () => {
    const style = {
      fontSize: 16,
      lineHeight: '32px',
      flex: 1,
      marginLeft: 20,
    };
    const title =
      typeof item?.title === 'function' ? item.title() : item?.title || '';
    return <div style={style}>{title}</div>;
  };

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    zIndex: isDragging ? '100' : 'auto',
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={styles}>
      <MenuOutlined {...listeners} {...attributes} />
      {content()}
      <Switch
        checked={
          item?.hidden === undefined || item?.hidden === false ? true : false
        }
        onChange={() => onChange()}
      />
    </div>
  );
};

export default TableSetting;
