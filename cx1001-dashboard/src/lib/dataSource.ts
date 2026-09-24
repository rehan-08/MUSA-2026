import type { DataSource } from '../types';
import { MockDataSource } from './mockDataSource';
import { RealDataSource } from './realDataSource';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const dataSource: DataSource = USE_MOCK ? new MockDataSource() : new RealDataSource();
