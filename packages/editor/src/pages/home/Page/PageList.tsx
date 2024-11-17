import { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Form, Layout, Pagination, Spin } from 'antd';
import { getPageList } from '@/api';
import pageApi from '@/api/page';
import CreatePage from '@/components/CreatePage';
import SearchBar from '@/components/Searchbar/SearchBar';
import PageCard from './components/PageCard';
import ProjectCard from './components/ProjectCard';
import styles from './../index.module.less';
import styles2 from './page.module.less';

/**
 * 页面列表
 */

export default function Index() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const createPageRef = useRef<{ open: () => void }>();
  const [type, setType] = useState('project');

  useEffect(() => {
    getList(current, pageSize);
  }, [current, pageSize]);

  // 列表切换
  const handleViewChange = (value: string) => {
    setType(value);
    setCurrent(1);
    setList([]);
    getList(1, pageSize, value);
  };

  // 加载页面列表
  const getList = async (pageNum: number = current, size: number = pageSize, value: string = type) => {
    setLoading(true);
    try {
      const { keyword } = form.getFieldsValue();
      const promise = value === 'project' ? pageApi.getCategoryList : getPageList;
      const res = await promise({
        pageNum,
        pageSize: size,
        keyword,
      });
      setTotal(res?.total || 0);
      setList(res?.list || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  // 切换页码和每页条数回调
  const handleChange = (_current: number, size: number) => {
    setCurrent(_current);
    setPageSize(size);
  };

  // 新建页面
  const handleCreate = () => {
    createPageRef.current?.open();
  };

  // 提交搜索
  const handleSearch = () => {
    setCurrent(1);
    getList(1, pageSize);
  };

  return (
    <>
      <Layout.Content className={styles.pageList}>
        <SearchBar
          showGroup={false}
          form={form}
          from="页面"
          submit={handleSearch}
          refresh={getList}
          onCreate={handleCreate}
          onViewChange={handleViewChange}
        />

        {/* 加载项目列表 */}
        {type === 'project' ? (
          <div className={styles2.projectGrid}>
            {list.map((project: any) => (
              <ProjectCard project={project} key={project.id} />
            ))}
          </div>
        ) : null}

        {/* 加载页面列表 */}
        {(total > 0 || loading) && type === 'list' ? (
          <>
            <div className={styles.pagesContent}>
              <Spin spinning={loading} size="large" tip="加载中...">
                <PageCard list={list} getList={getList} />
              </Spin>
            </div>
            <Pagination
              total={total}
              current={current}
              showSizeChanger
              pageSize={pageSize}
              pageSizeOptions={['12', '16', '20', '50']}
              showTotal={(total) => `总共 ${total} 条`}
              align="end"
              onChange={handleChange}
            />
          </>
        ) : (
          !loading &&
          type === 'list' && (
            <Empty style={{ marginTop: 100 }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={handleCreate}>
                创建页面
              </Button>
            </Empty>
          )
        )}

        {/* 新建页面 */}
        <CreatePage title="创建页面" createRef={createPageRef} update={() => getList(1, pageSize)} />
      </Layout.Content>
    </>
  );
}