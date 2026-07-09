/* ============================================================
   CyberSchedule_Matrix — Storage Layer (IndexedDB via Dexie.js)
   v1.1: period / time_range / completed schema
   ============================================================ */

const db = new Dexie('CyberScheduleDB');

// v1: old schema (start_time, end_time, color_override)
db.version(1).stores({
  schedules: 'id, date, tag'
});

// v2: new schema with period, time_range, completed
db.version(2).stores({
  schedules: 'id, date, tag, period, completed'
});

const Storage = {

  // --- Create ---
  async add(item) {
    const now = new Date().toISOString();
    const record = {
      id: crypto.randomUUID(),
      date: item.date,
      period: item.period || 'MORNING',
      time_range: item.time_range || '',
      title: item.title || '',
      completed: item.completed || false,
      tag: item.tag || 'STUDY',
      created_at: now,
      updated_at: now
    };
    await db.schedules.put(record);
    return record;
  },

  // --- Read ---
  async get(id) {
    return db.schedules.get(id);
  },

  async getByDate(date) {
    return db.schedules.where('date').equals(date).sortBy('period');
  },

  async getByRange(startDate, endDate) {
    return db.schedules
      .where('date')
      .between(startDate, endDate, true, true)
      .sortBy('date');
  },

  async getAll() {
    return db.schedules.toArray();
  },

  // --- Update ---
  async update(id, changes) {
    changes.updated_at = new Date().toISOString();
    return db.schedules.update(id, changes);
  },

  // --- Toggle Complete ---
  async toggleComplete(id) {
    const item = await db.schedules.get(id);
    if (!item) return null;
    const updated = !item.completed;
    await db.schedules.update(id, {
      completed: updated,
      updated_at: new Date().toISOString()
    });
    return updated;
  },

  // --- Delete ---
  async remove(id) {
    return db.schedules.delete(id);
  },

  // --- Clone day ---
  async cloneDay(fromDate, toDate) {
    const items = await this.getByDate(fromDate);
    const cloned = [];
    for (const item of items) {
      const { id, created_at, updated_at, ...rest } = item;
      const newItem = {
        ...rest,
        date: toDate,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await db.schedules.put(newItem);
      cloned.push(newItem);
    }
    return cloned;
  },

  // --- Bulk add (for template fill) ---
  async bulkAdd(items) {
    const now = new Date().toISOString();
    const records = items.map(item => ({
      id: crypto.randomUUID(),
      date: item.date,
      period: item.period || 'MORNING',
      time_range: item.time_range || '',
      title: item.title || '',
      completed: item.completed || false,
      tag: item.tag || 'STUDY',
      created_at: now,
      updated_at: now
    }));
    await db.transaction('rw', db.schedules, async () => {
      await db.schedules.bulkPut(records);
    });
    return records.length;
  },

  // --- Clear one day's items ---
  async clearDate(date) {
    return db.schedules.where('date').equals(date).delete();
  }
};
