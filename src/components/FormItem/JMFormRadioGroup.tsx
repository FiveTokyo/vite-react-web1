import React, { useEffect, memo, useState } from 'react';
import { Checkbox, ConfigProvider } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

interface FormCheckBoxProps {
  options?: Array<string | { label: string; value: any }>;
  max?: number;
  value?: string | number | Array<any>;
  onChange?: (value: string | number | Array<any>) => void;
  readonly?: boolean;
  splitstr?: string;
  onChangeCallback?: (
    checked: boolean,
    item: { label: string; value: any }
  ) => void;
  itemStyle?: React.CSSProperties;
}

const JMFormRadioGroup = memo<FormCheckBoxProps>((props) => {
  const {
    options = [],
    max = options.length,
    value,
    onChange,
    readonly = false,
    splitstr = ',',
    onChangeCallback = null,
    itemStyle = {},
  } = props;

  const [data, setData] = useState<Array<any>>([]);

  useEffect(() => {
    let v: Array<any> = [];
    if (Array.isArray(value)) {
      v = value;
    } else if (typeof value === 'string') {
      v = value.split(splitstr);
    } else if (typeof value === 'number') {
      v = [value];
    }
    setData(v);
  }, [value, splitstr]);

  const checkOnChange = (
    checked: boolean,
    item: { label: string; value: any }
  ) => {
    let t: Array<any> = [];
    if (max === 1) {
      t = data[0] === item.value ? [] : [item.value];
    } else {
      t = checked
        ? [...data, item.value]
        : data.filter((k) => k !== item.value);
    }
    onChange?.(max === 1 ? t[0] : t);
    if (onChangeCallback) {
      onChangeCallback(checked, item);
    }
  };

  const list: {
    label: string;
    value: any;
  }[] = Array.isArray(options)
    ? options.map((item) =>
        typeof item === 'string' ? { label: item, value: item } : item
      )
    : [];

  if (readonly) {
    return (
      <label>
        {list
          .filter((item) => data.includes(item.value))
          .map((item) => item.label)
          .join('、') || '-'}
      </label>
    );
  }

  return (
    <ConfigProvider prefixCls="ant-radio">
      <div className="ant-radio-group-solid">
        {list?.map((item) => {
          const checked = Array.isArray(data) && data.includes(item.value);
          return (
            <Checkbox
              key={item.value}
              onChange={(e: CheckboxChangeEvent) =>
                checkOnChange(e.target.checked, item)
              }
              className={`ant-radio-button-wrapper ${
                checked ? 'ant-radio-button-wrapper-checked' : ''
              }`}
              style={{
                width: item.label?.length! < 4 ? 83 : 'auto',
                textAlign: 'center',
                ...itemStyle,
              }}
            >
              {item.label}
            </Checkbox>
          );
        })}
      </div>
    </ConfigProvider>
  );
});

export default JMFormRadioGroup;
