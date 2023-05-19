import { Image, Space } from 'antd';

interface ImagePreviewProps {
  images?: Array<string>;
  style?: React.CSSProperties;
  size?: {
    width: number;
    height: number;
  };
}

const JMImagePreview: React.FC<ImagePreviewProps> = (props) => {
  const {
    images = [],
    style = {},
    size = {
      width: 60,
      height: 60,
    },
  } = props;

  if (!Array.isArray(images)) {
    return <></>;
  }

  return (
    <Image.PreviewGroup>
      <Space size={10} style={{ marginTop: 10, ...style }} wrap>
        {images.map((z, i) => (
          <Image
            key={`${i}`}
            src={z}
            width={size.width}
            height={size.height}
            style={{ objectFit: 'cover' }}
          />
        ))}
      </Space>
    </Image.PreviewGroup>
  );
};
export default JMImagePreview;
