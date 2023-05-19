import { Table } from 'antd';
import { useRef, useMemo } from 'react';

const AutoHeightTable = (props) => {
  const { tableWidth, scrollY, ...other } = props;
  const target = useRef(null);

  const tableHeight = useMemo(() => {
    if (scrollY) return scrollY;
    if (target.current) {
      let tHeader = target.current.getElementsByClassName('ant-table-thead')[0];
      let tHeaderBottom = 0;
      if (tHeader) {
        tHeaderBottom = tHeader.getBoundingClientRect().bottom;
      }
      const h = `calc(100vh - ${tHeaderBottom + 20}px)`;

      //空状态时给tbody设置默认高度
      const el = target.current.getElementsByClassName('ant-table-tbody')[0];
      el.style.height = props.dataSource?.length === 0 ? h : null;

      return h;
    }
    return '70vh';
  }, [props.loading]);

  return (
    <div ref={target}>
      <Table
        {...other}
        scroll={{ x: tableWidth, y: tableHeight }}
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default AutoHeightTable;
