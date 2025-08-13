// Migration utilities and helpers
export const migrationHelpers = {
  // Generate migration timestamp
  generateTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[-:T]/g, '').replace(/\.\d{3}Z$/, '');
  },

  // Common RLS policies
  enableRLS(tableName: string): string {
    return `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`;
  },

  userOwnershipPolicy(tableName: string, userColumn = 'user_id'): string {
    return `
CREATE POLICY "${tableName}_owner_policy" ON ${tableName}
FOR ALL USING (${userColumn} = auth.uid());`;
  },

  publicReadPolicy(tableName: string): string {
    return `
CREATE POLICY "${tableName}_public_read" ON ${tableName}
FOR SELECT USING (true);`;
  },

  // Common table columns
  userColumns(): string {
    return `
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`;
  },

  timestampColumns(): string {
    return `
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL`;
  },

  // Update trigger for updated_at
  updateTimestampTrigger(tableName: string): string {
    return `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_${tableName}_updated_at
  BEFORE UPDATE ON ${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();`;
  },

  // Index helpers
  createIndex(tableName: string, columnName: string, unique = false): string {
    const uniqueStr = unique ? 'UNIQUE ' : '';
    return `CREATE ${uniqueStr}INDEX idx_${tableName}_${columnName} ON ${tableName}(${columnName});`;
  },

  createCompoundIndex(tableName: string, columns: string[]): string {
    const indexName = `idx_${tableName}_${columns.join('_')}`;
    return `CREATE INDEX ${indexName} ON ${tableName}(${columns.join(', ')});`;
  },
};