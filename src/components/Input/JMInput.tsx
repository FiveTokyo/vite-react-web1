import { Input } from 'antd';
import { CompoundedComponent } from 'antd/es/float-button/interface';
import React, { useState, useEffect, ChangeEvent } from 'react';

interface CommonInputProps extends CompoundedComponent {
  value?: string;
  onChange?: (value: string) => void;
}

const JMInput: React.FC<CommonInputProps> = (props) => {
  const { value, onChange, ...restProps } = props;

  const [curValue, setValue] = useState<string | undefined>(value);
  const [isComposing, setComposing] = useState(false); // 是否正在输入法录入中
  // 是否是谷歌浏览器
  const isChrome = navigator.userAgent.indexOf('WebKit') > -1;

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleCompositionStart = () => {
    setComposing(true);
  };

  const handleCompositionEnd = (
    event: React.CompositionEvent<HTMLInputElement>
  ) => {
    setComposing(false);
    // 谷歌浏览器onChange事件在handleCompositionEnd之前触发
    if (isChrome) {
      onChange?.(event.currentTarget.value);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // 没有采用输入法的值
    const rawValue = event.target.value;
    setValue(rawValue);
    if (!isComposing) {
      onChange?.(rawValue);
    }
  };

  return (
    <Input
      placeholder="请输入"
      allowClear
      {...restProps}
      value={curValue}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
};

export default React.memo(JMInput);
