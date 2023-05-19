import { findNode, renderNode } from '@/utils/tree';
import { BetaSchemaForm } from '@ant-design/pro-form';
import { cloneDeep, debounce, pick } from 'lodash-es';
import { useContext, useEffect, useRef, useState } from 'react';
import { JMTableContext } from '..';

const TableInlineSearch = (props) => {
  const {
    saveKey,
    cols,
    param,
    setParam,
    currentFilterParam,
    commonSearchCols: searchCols,
  } = useContext(JMTableContext);

  const savePath = `${saveKey}_commonSearch`;

  const formRef = useRef();
  const isSelfChange = useRef(false);
  const [columns, setColumns] = useState(() => {
    const item = localStorage.getItem(savePath);
    if (item) {
      return updateColumn(JSON.parse(item));
    }
    return [];
  });
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (searchCols?.label === savePath) {
      const c = updateColumn(searchCols.value);
      setColumns(c);
      refreshForm(c);
      setCollapsed(false);
    }
  }, [searchCols]);

  useEffect(() => {
    if (param?.filter) {
      refreshForm();
    }
  }, [param]);

  useEffect(() => {
    if (cols && columns.length) {
      const c = updateColumn(columns.map((d) => d.dataIndex));
      setColumns(c);
    }
  }, [cols]);

  function refreshForm(c = columns) {
    if (isSelfChange.current) {
      isSelfChange.current = false;
      return;
    }
    formRef.current?.resetFields();
    formRef.current?.setFieldsValue(
      pick(
        param.filter,
        c.map((d) => d.dataIndex)
      )
    );
  }

  function updateColumn(columnKeys) {
    let c = [];
    columnKeys.forEach((item) => {
      let d = findNode(cols, item, 'dataIndex');
      if (d) {
        if (d.children) {
          d.children.forEach((k) => {
            c.push(formatItem(k));
          });
        } else {
          c.push(formatItem(d));
        }
      }
    });
    return c;
  }

  function formatItem(d) {
    d.title = d.formTitle || d.title;
    return d;
  }

  if (!columns?.length) return <></>;

  const requestData = debounce(setParam, 800);

  function onValuesChange(v) {
    isSelfChange.current = true;
    const filterKey = Object.keys(v)[0];
    currentFilterParam.current = {
      filter: filterKey,
    };
    filterKey &&
      renderNode(cols, (d) => {
        if (!d.dependencyUpdateNotClaer && d.dependency?.includes(filterKey)) {
          formRef.current.resetFields([d.dataIndex]);
        }
      });
    const a = formRef.current?.getFieldsValue();
    requestData(a);
  }

  function onFinish() {
    const a = formRef.current?.getFieldsValue();
    setParam(a);
  }

  function onReset() {
    const res = cloneDeep(param.filter);
    const keys = columns.map((d) => d.dataIndex);
    Object.entries(res).forEach((d) => {
      if (keys.includes(d[0])) {
        res[d[0]] = undefined;
      }
    });
    setParam(res);
  }

  return (
    <BetaSchemaForm
      formRef={formRef}
      columns={columns}
      layoutType="QueryFilter"
      labelWidth="auto"
      span={6}
      omitNil={false}
      autoFocusFirstInput={false}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      onValuesChange={onValuesChange}
      onFinish={onFinish}
      onReset={onReset}
      style={{ marginTop: 10 }}
      submitter={{
        searchConfig: {
          submitText: '搜索',
        },
        render: (_, dom) => {
          return [dom[1], dom[0]];
        },
      }}
    />
  );
};

export default TableInlineSearch;
