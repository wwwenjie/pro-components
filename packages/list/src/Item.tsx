import React, { useContext, useMemo } from 'react';
import { List, Avatar, Skeleton, ConfigProvider } from 'antd';
import type { ProCardProps } from '@ant-design/pro-card';
import type { GetComponentProps } from './index';
import ProCard from '@ant-design/pro-card';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import type { ListGridType } from 'antd/lib/list';
import type { ExpandableConfig } from 'antd/lib/table/interface';
import { RightOutlined } from '@ant-design/icons';
import classNames from 'classnames';

export type RenderExpandIconProps<RecordType> = {
  prefixCls: string;
  expanded: boolean;
  expandIcon:
    | React.ReactNode
    | ((props: {
        onExpand: (expanded: boolean) => void;
        expanded: boolean;
        record: RecordType;
      }) => React.ReactNode);
  onExpand: (expanded: boolean) => void;
  record: RecordType;
};

export function renderExpandIcon<RecordType>({
  prefixCls,
  expandIcon = <RightOutlined />,
  onExpand,
  expanded,
  record,
}: RenderExpandIconProps<RecordType>) {
  let icon = expandIcon;
  const expandClassName = `${prefixCls}-row-expand-icon`;

  const onClick: React.MouseEventHandler<HTMLElement> = (event) => {
    onExpand(!expanded);
    event.stopPropagation();
  };

  if (typeof expandIcon === 'function') {
    icon = expandIcon({ expanded, onExpand, record });
  }

  return (
    <span
      className={classNames(expandClassName, {
        [`${prefixCls}-row-expanded`]: expanded,
        [`${prefixCls}-row-collapsed`]: !expanded,
      })}
      onClick={onClick}
    >
      {icon}
    </span>
  );
}

export type ItemProps<RecordType> = {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  checkbox?: React.ReactNode;
  className?: string;
  prefixCls?: string;
  item?: any;
  subheader?: {
    title: React.ReactNode;
    actions: React.ReactNode[];
  };
  index: number;
  selected?: boolean;
  avatar?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode[];
  extra?: React.ReactNode;
  description?: React.ReactNode;
  loading?: boolean;
  style?: React.CSSProperties;
  grid?: ListGridType;
  expand?: boolean;
  rowSupportExpand?: boolean;
  cardActionProps?: 'actions' | 'extra';
  onExpand?: (expand: boolean) => void;
  expandable?: ExpandableConfig<any>;
  showActions?: 'hover' | 'always';
  showExtra?: 'hover' | 'always';
  type?: 'new' | 'top' | 'inline' | 'subheader';
  isEditable: boolean;
  recordKey: string | number | undefined;
  cardProps?: ProCardProps;
  record: RecordType;
  onRow?: GetComponentProps<RecordType>;
  itemHeaderRender?:
    | ((item: RecordType, index: number, defaultDom: JSX.Element | null) => React.ReactNode)
    | false;
  itemTitleRender?:
    | ((item: RecordType, index: number, defaultDom: JSX.Element | null) => React.ReactNode)
    | false;
};

function ProListItem<RecordType>(props: ItemProps<RecordType>) {
  const { prefixCls: customizePrefixCls } = props;
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('pro-list', customizePrefixCls);
  const defaultClassName = `${prefixCls}-row`;

  const {
    title,
    subTitle,
    content,
    itemTitleRender,
    prefixCls: restPrefixCls,
    actions,
    item,
    recordKey,
    avatar,
    cardProps,
    description,
    isEditable,
    checkbox,
    index,
    selected,
    loading,
    expand: propsExpand,
    onExpand: propsOnExpand,
    expandable: expandableConfig,
    rowSupportExpand,
    showActions,
    showExtra,
    type,
    style,
    className: propsClassName = defaultClassName,
    record,
    onRow,
    itemHeaderRender,
    cardActionProps,
    extra,
    ...rest
  } = props;

  const {
    expandedRowRender,
    expandIcon,
    expandRowByClick,
    indentSize = 8,
    expandedRowClassName,
  } = expandableConfig || {};

  const [expanded, onExpand] = useMergedState<boolean>(!!propsExpand, {
    value: propsExpand,
    onChange: propsOnExpand,
  });

  const className = classNames(
    {
      [`${defaultClassName}-selected`]: !cardProps && selected,
      [`${defaultClassName}-show-action-hover`]: showActions === 'hover',
      [`${defaultClassName}-type-${type}`]: !!type,
      [`${defaultClassName}-editable`]: isEditable,
      [`${defaultClassName}-show-extra-hover`]: showExtra === 'hover',
    },
    defaultClassName,
  );

  const extraClassName = classNames({
    [`${propsClassName}-extra`]: showExtra === 'hover',
  });

  const needExpanded = expanded || Object.values(expandableConfig || {}).length === 0;
  const expandedRowDom =
    expandedRowRender && expandedRowRender(record, index, indentSize, expanded);

  const extraDom = useMemo(() => {
    if (!actions || cardActionProps === 'actions') {
      return undefined;
    }

    return [
      <div key="action" onClick={(e) => e.stopPropagation()}>
        {actions}
      </div>,
    ];
  }, [actions, cardActionProps]);

  const actionsDom = useMemo(() => {
    if (!actions || !cardActionProps || cardActionProps === 'extra') {
      return undefined;
    }

    return [
      <div key="action" onClick={(e) => e.stopPropagation()}>
        {actions}
      </div>,
    ];
  }, [actions, cardActionProps]);

  const titleDom =
    title || subTitle ? (
      <div className={`${className}-header-title`}>
        {title && <div className={`${className}-title`}>{title}</div>}
        {subTitle && <div className={`${className}-subTitle`}>{subTitle}</div>}
      </div>
    ) : null;

  const metaTitle = (itemTitleRender && itemTitleRender?.(record, index, titleDom)) ?? titleDom;
  const metaDom =
    metaTitle || avatar || subTitle || description ? (
      <List.Item.Meta
        avatar={avatar}
        title={metaTitle}
        description={
          description &&
          needExpanded && <div className={`${className}-description`}>{description}</div>
        }
      />
    ) : null;

  const rowClassName = classNames({
    [`${className}-item-has-checkbox`]: checkbox,
    [`${className}-item-has-avatar`]: avatar,
    [className]: className,
  });
  const cardTitleDom = useMemo(() => {
    if (avatar || title) {
      return (
        <>
          {avatar && (
            <Avatar size={22} src={avatar} className={getPrefixCls('list-item-meta-avatar')} />
          )}
          <span className={getPrefixCls('list-item-meta-title')}>{title}</span>
        </>
      );
    }
    return null;
  }, [avatar, getPrefixCls, title]);

  const defaultDom = !cardProps ? (
    <List.Item
      className={classNames(rowClassName, {
        [propsClassName]: propsClassName !== defaultClassName,
      })}
      {...rest}
      actions={extraDom}
      extra={!!extra && <div className={extraClassName}>{extra}</div>}
      {...onRow?.(record, index)}
      onClick={(e) => {
        onRow?.(record, index)?.onClick?.(e);
        if (expandRowByClick) {
          onExpand(!expanded);
        }
      }}
    >
      <Skeleton avatar title={false} loading={loading} active>
        <div className={`${className}-header`}>
          <div className={`${className}-header-option`}>
            {!!checkbox && <div className={`${className}-checkbox`}>{checkbox}</div>}
            {Object.values(expandableConfig || {}).length > 0 &&
              rowSupportExpand &&
              renderExpandIcon({
                prefixCls,
                expandIcon,
                onExpand,
                expanded,
                record,
              })}
          </div>
          {(itemHeaderRender && itemHeaderRender?.(record, index, metaDom)) ?? metaDom}
        </div>
        {needExpanded && (content || expandedRowDom) && (
          <div className={`${className}-content`}>
            {content}
            {expandedRowRender && rowSupportExpand && (
              <div
                className={expandedRowClassName && expandedRowClassName(record, index, indentSize)}
              >
                {expandedRowDom}
              </div>
            )}
          </div>
        )}
      </Skeleton>
    </List.Item>
  ) : (
    <ProCard
      bordered
      loading={loading}
      hoverable
      {...cardProps}
      title={cardTitleDom}
      subTitle={subTitle}
      extra={extraDom}
      actions={actionsDom}
    >
      <Skeleton avatar title={false} loading={loading} active>
        <div className={`${className}-header`}>
          {itemTitleRender && itemTitleRender?.(record, index, titleDom)}
          {content}
        </div>
      </Skeleton>
    </ProCard>
  );
  if (!cardProps) {
    return defaultDom;
  }
  return (
    <div
      className={classNames({
        [`${className}-card`]: cardProps,
        [propsClassName]: propsClassName !== defaultClassName,
      })}
      style={style}
    >
      {defaultDom}
    </div>
  );
}

export default ProListItem;
