import { CloseOutlined, FilterFilled } from '@ant-design/icons';
import {
  Button,
  Popover,
  Card,
  Collapse,
  Popconfirm,
  Space,
  message,
} from 'antd';
import {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useContext,
  useRef,
  memo,
  useMemo,
} from 'react';
import ProForm, { BetaSchemaForm } from '@ant-design/pro-form';
import { findNode, renderNode } from '@/utils/tree';
import { getPathName } from '@/utils/common';
import CommonSearchMenu from './CommonSearchMenu';
import AddFilterMenu from './AddFilterMenu';
import { isEmpty, debounce, merge, random, cloneDeep } from 'lodash-es';
import { JMTableContext } from '..';

const SAVEKEY = 'sk-search';
const JMSearch = forwardRef((props, ref) => {
  const { reset, showCommonSearch = true } = props;

  const {
    saveKey,
    searchMemo: cols,
    setParam,
    currentFilterParam,
  } = useContext(JMTableContext);

  const formRef = useRef();
  const [columnKeys, setColumnKeys] = useState([]);
  const [searchHistory, setSearchHistory] = useState(() => getCurrent());
  const [activeItem, setActiveItem] = useState();
  const [visible, setVisible] = useState(false);
  const [collapseActiveKey, setCollapseActiveKey] = useState();

  useImperativeHandle(ref, () => ({
    addColumn,
    updateColumn,
  }));

  useEffect(() => {
    if (activeItem) {
      setColumnKeys(activeItem.columnKeys);
      let values = {};
      Object.entries(activeItem.value).forEach((d) => {
        let result = {};
        result[d[0]] = d[1];
        values = merge(values, formatData(result));
      });
      formRef.current.setFieldsValue(activeItem.value);
      setTimeout(() => {
        setParam((v) => ({
          ...v,
          ...values,
        }));
      }, 250);
    }
  }, [activeItem]);

  if (!cols?.length) return <></>;

  function getSearchHistory() {
    let item = localStorage.getItem(SAVEKEY);
    return item ? JSON.parse(item) : {};
  }

  function getCurrent() {
    const all = getSearchHistory();
    const path = saveKey || getPathName();
    return all[path];
  }

  function saveToStorage(result) {
    const path = saveKey || getPathName();
    let item = getSearchHistory();
    item[path] = result;
    window.localStorage.setItem(SAVEKEY, JSON.stringify(item));
  }

  function deleteHistory(index) {
    let result = getCurrent();
    result?.splice(index, 1);
    saveToStorage(result);
    return result;
  }

  function addHistoty(item) {
    const current = getCurrent();
    const result = current?.length ? [...current, item] : [item];
    saveToStorage(result);
    return result;
  }

  const onSave = (v) => {
    let value = formRef.current?.getFieldsValue();
    const item = {
      label: v?.title,
      columnKeys,
      value,
    };
    const items = addHistoty(item);
    setSearchHistory(items);
    item.activeKey = `${items.length - 1}`;
    setCollapseActiveKey(item.activeKey);
    setActiveItem(item);
  };

  const updateSaveStorage = (index) => {
    let value = formRef.current?.getFieldsValue();
    let result = getCurrent();
    result[index].value = value;
    result[index].columnKeys = columnKeys;
    saveToStorage(result);
    setSearchHistory(result);
    message.success('保存成功');
  };

  function addColumn(key) {
    setVisible(true);
    if (columnKeys.includes(key)) {
      visible && setVisible(false);
      return;
    }
    setColumnKeys([...columnKeys, key]);
  }

  function updateColumn(filters) {
    let c = [...columnKeys];
    try {
      Object.entries(filters).forEach((filterArr) => {
        let key = filterArr[0];
        let value = filterArr[1];
        const item = findNode(cols, key, 'dataIndex');
        if (!value) {
          if (c.includes(key)) {
            if (item.filterResetToDefaultFilteredValue === true) {
              formRef.current?.resetFields([`${key}`]);
            } else {
              formRef.current?.setFieldValue(key, undefined);
            }
          }
        } else {
          formRef.current?.setFieldValue(`${key}`, value);
          if (item?.parentKey) {
            key = item.parentKey;
          }
          if (!c.includes(key)) {
            c = [...c, key];
          }
        }
      });
    } catch (e) {}

    setColumnKeys(c);
  }

  function deleteItem(e, i) {
    e.stopPropagation();
    const items = deleteHistory(i);
    setSearchHistory(items);
    if (activeItem) {
      setTimeout(() => {
        formRef.current?.resetFields();
        reset();
        setColumnKeys([]);
        setActiveItem();
      }, 0);
    }
  }

  function addMenu(key, type) {
    if (activeItem && type === 'common') {
      formRef.current?.resetFields();
      reset();
      setActiveItem();
      setColumnKeys([key]);
      setCollapseActiveKey();
    } else {
      setColumnKeys([...columnKeys, key]);
    }
  }

  function deleteMenu(key) {
    const values = formRef.current.getFieldsValue();
    setColumnKeys(columnKeys.filter((d) => d !== key));
    const item = findNode(cols, key, 'dataIndex');
    if (!item.children && !values[key]) {
      return;
    }

    setParam((v) => {
      const result = { ...v };
      if (item.children) {
        item.children.forEach((k) => {
          result.filter[`${k.dataIndex}`] = undefined;
          formRef.current?.resetFields([`${k.dataIndex}`]);
        });
      } else {
        result.filter[`${key}`] = undefined;
        formRef.current?.resetFields([`${key}`]);
      }
      return result;
    });
  }

  function formatData(a) {
    const key = Object.keys(a)[0];
    let value = Object.values(a)[0];
    const d = findNode(cols, key, 'dataIndex'); // cols.find(d => d.dataIndex === key)
    let obj = {};
    if (
      isEmpty(value) &&
      d?.filterResetToDefaultFilteredValue &&
      d?.initialValue
    ) {
      value = d?.initialValue;
    }
    obj[key] = value;
    return {
      filter: obj,
    };
  }

  const onValuesChange = (v) => {
    let filterKey = Object.keys(v)[0];
    currentFilterParam.current = {
      filter: filterKey,
    };
    filterKey &&
      renderNode(cols, (d) => {
        const dependency = d.dependency || d.dependencies;
        if (!d.dependencyUpdateNotClaer && dependency?.includes(filterKey)) {
          formRef.current.resetFields([d.dataIndex]);
        }
      });

    let values = {};
    Object.entries(formRef.current.getFieldsValue()).forEach((d) => {
      let result = {};
      result[d[0]] = d[1];
      values = merge(values, formatData(result));
    });
    setParam((v) => ({
      ...v,
      filter: values.filter || {},
    }));
  };

  const debounceValuesChange = debounce(onValuesChange, 800);

  const extra = (i) => (
    <Space>
      <Popconfirm
        title="是否删除当前常用搜索"
        onConfirm={(e) => deleteItem(e, i)}
      >
        <a>删除</a>
      </Popconfirm>
    </Space>
  );

  function formatItem(d) {
    d.title = d.formTitle || d.title;
    d.formItemProps = {
      style: {
        width: 400,
      },
    };
    d.width = '100%';
    return d;
  }
  const searchForm = (display) => {
    if (!display) return <></>;

    let columns = [];
    columnKeys.forEach((item) => {
      let d = cloneDeep(cols.find((k) => k.dataIndex === item));
      if (d) {
        let c = [];
        if (d.children) {
          d.children.forEach((k) => {
            c.push(formatItem(k));
          });
        } else {
          c.push(formatItem(d));
        }
        c.push({
          dataIndex: `${d.dataIndex}_delete`,
          renderFormItem: () => (
            <a
              type="link"
              onClick={() => deleteMenu(d.dataIndex)}
              style={{ width: 50 }}
            >
              <CloseOutlined />
            </a>
          ),
        });
        if (d.filterResetToDefaultFilteredValue && d.initialValue) {
          c.pop();
        }
        columns.push({
          valueType: 'group',
          fieldProps: {
            size: 12,
          },
          columns: c,
        });
      }
    });
    return (
      <div style={{ padding: '0 10px' }}>
        <BetaSchemaForm
          layoutType="Embed"
          columns={columns}
          shouldUpdate={false}
          autoFocusFirstInput={false}
          syncToInitialValues={false}
        />
      </div>
    );
  };

  const actionView = useMemo(() => {
    let result = formRef.current?.getFieldsValue() || {};
    const length =
      activeItem?.label ||
      Object.values(result)?.filter((d) => {
        if (typeof d === 'number') {
          return d !== 0;
        }
        return !isEmpty(d);
      })?.length ||
      0;

    if (!length) {
      return (
        <Button
          type="link"
          icon={<FilterFilled style={{ fontSize: 16, color: '#999' }} />}
        />
      );
    }
    return (
      <Button
        type="link"
        icon={<FilterFilled style={{ fontSize: 16, color: '#1890FF' }} />}
        style={{ background: '#e6f7ff' }}
      >
        <span style={{ fontSize: 16 }}>
          {activeItem?.label || `${length} 项`}
        </span>
        <CloseOutlined
          style={{ fontSize: 16 }}
          onClick={(e) => {
            e.stopPropagation();
            window.history.pushState({}, '', window.location.pathname);
            formRef.current?.resetFields();
            setColumnKeys([]);
            setActiveItem();
            setVisible(false);
            reset();
          }}
        />
      </Button>
    );
  }, [columnKeys, activeItem]);

  const content = useMemo(() => {
    const menus = cols.filter((d) => !columnKeys.includes(d.dataIndex));
    const commonSearchOption = cols.map((d) => ({
      label: typeof d.title === 'function' ? d.title() : d.title,
      value: d.dataIndex,
    }));

    return (
      <ProForm
        layout="horizontal"
        formRef={formRef}
        submitter={false}
        omitNil={false}
        onValuesChange={debounceValuesChange}
      >
        <Card
          title="自定义筛选"
          headStyle={{ padding: 0, paddingLeft: 12 }}
          bodyStyle={{ background: '#f2f4f6', padding: '10px 0' }}
        >
          {searchForm(!activeItem && columnKeys?.length > 0)}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <AddFilterMenu
              type={`common-${random(0, 100000)}`}
              menus={activeItem ? cols : menus}
              onSelect={(v) => addMenu(v, 'common')}
            />
            {saveKey && !activeItem && columnKeys?.length > 0 && (
              <BetaSchemaForm
                columns={[
                  {
                    dataIndex: 'title',
                    title: '名称',
                    required: true,
                  },
                ]}
                layoutType="ModalForm"
                title={'保存为常用搜索'}
                trigger={<Button type="link">保存</Button>}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 15 }}
                width={600}
                modalProps={{
                  zIndex: 9999,
                }}
                onFinish={onSave}
              />
            )}
          </div>
        </Card>
        {saveKey && searchHistory && (
          <Card
            title="我的筛选"
            style={{ marginTop: 10 }}
            headStyle={{ padding: 0, paddingLeft: 12 }}
            bodyStyle={{ background: '#f2f4f6', padding: '0' }}
          >
            <Collapse
              expandIconPosition="end"
              accordion
              onChange={(v) => {
                setCollapseActiveKey(v);
                if (v) {
                  const item = searchHistory[~~v];
                  item.activeKey = v;
                  setActiveItem(item);
                }
              }}
              activeKey={collapseActiveKey}
            >
              {searchHistory?.map((d, i) => {
                return (
                  <Collapse.Panel
                    header={
                      <label
                        style={{
                          color:
                            activeItem?.activeKey == i ? '#1890FF' : '#333',
                        }}
                      >
                        {d.label}
                      </label>
                    }
                    key={i + ''}
                    extra={extra(i)}
                  >
                    {searchForm(activeItem && columnKeys?.length > 0)}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <AddFilterMenu
                        type={`self-${random(0, 100000)}`}
                        menus={activeItem ? menus : cols}
                        onSelect={(v) => addMenu(v, 'self')}
                      />
                      <Button type="link" onClick={() => updateSaveStorage(i)}>
                        保存
                      </Button>
                    </div>
                  </Collapse.Panel>
                );
              })}
            </Collapse>
          </Card>
        )}
        {showCommonSearch ? (
          <CommonSearchMenu options={commonSearchOption} saveKey={saveKey} />
        ) : (
          ''
        )}
      </ProForm>
    );
  }, [columnKeys, activeItem]);

  return (
    <Popover
      trigger="click"
      placement="bottom"
      open={visible}
      onOpenChange={(v) => {
        setVisible(v);
      }}
      content={content}
      forceRender={true}
      overlayStyle={{ width: 490, padding: 0 }}
      overlayInnerStyle={{ padding: 0 }}
    >
      {actionView}
    </Popover>
  );
});

export default memo(JMSearch);
