// ============================================================================
// Database Seed Script - 初始化示例数据
// 
// 运行: npx prisma db seed
// ============================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// M8 Compact 系列 Schema 定义
// ============================================================================

const M8_COMPACT_SCHEMA = {
  fields: [
    // 电气参数组
    {
      key: 'voltage_rating',
      label: '额定电源 Ue',
      type: 'select',
      options: ['24V DC/AC', '12V DC', '48V DC'],
      required: true,
      group: 'electrical',
    },
    {
      key: 'working_voltage',
      label: '额定工作电压 Ue',
      type: 'text',
      default: '16...30V DC',
      required: true,
      group: 'electrical',
    },
    {
      key: 'current_load',
      label: '电流负载能力',
      type: 'number',
      unit: 'A',
      min: 0,
      max: 10,
      default: 2,
      required: true,
      group: 'electrical',
    },
    {
      key: 'total_current',
      label: '总电流',
      type: 'number',
      unit: 'A',
      min: 0,
      max: 20,
      default: 6,
      required: true,
      group: 'electrical',
    },
    // 物理参数组
    {
      key: 'port_count',
      label: '端口数量',
      type: 'select',
      options: ['4', '6', '8', '10'],
      required: true,
      group: 'physical',
    },
    {
      key: 'ip_rating',
      label: '外壳防护等级',
      type: 'text',
      default: 'IP67',
      required: true,
      group: 'physical',
    },
    {
      key: 'channel_type',
      label: '通道类型',
      type: 'select',
      options: [
        { value: 'single', label: '单通道 Single' },
        { value: 'dual', label: '双通道 Dual' },
      ],
      default: 'single',
      group: 'physical',
    },
    // LED显示组
    {
      key: 'led_power_color',
      label: '电源指示灯颜色',
      type: 'select',
      options: ['green', 'none'],
      default: 'green',
      group: 'led',
    },
    {
      key: 'led_signal_color',
      label: '信号指示灯颜色',
      type: 'select',
      options: ['yellow', 'none'],
      default: 'yellow',
      group: 'led',
    },
  ],
  groups: [
    { key: 'electrical', label: '电气参数 Electrical', order: 1 },
    { key: 'physical', label: '物理参数 Physical', order: 2 },
    { key: 'led', label: 'LED指示 LED Display', order: 3 },
  ],
  version: 1,
};

// ============================================================================
// M8 Distributor 系列 Schema 定义
// ============================================================================

const M8_DISTRIBUTOR_SCHEMA = {
  fields: [
    // 电气参数组
    {
      key: 'voltage_rating',
      label: '额定电源 Ue',
      type: 'select',
      options: ['24V DC/AC'],
      required: true,
      group: 'electrical',
    },
    {
      key: 'working_voltage',
      label: '额定工作电压 Ue',
      type: 'text',
      default: '18–30V DC',
      required: true,
      group: 'electrical',
    },
    {
      key: 'current_load',
      label: '电流负载能力',
      type: 'number',
      unit: 'A',
      default: 2,
      required: true,
      group: 'electrical',
    },
    {
      key: 'total_current',
      label: '总电流',
      type: 'number',
      unit: 'A',
      default: 6,
      required: true,
      group: 'electrical',
    },
    // 物理参数组
    {
      key: 'port_count',
      label: '端口数量',
      type: 'select',
      options: ['8', '12', '16'],
      required: true,
      group: 'physical',
    },
    {
      key: 'ip_rating',
      label: '外壳防护等级',
      type: 'text',
      default: 'IP67',
      required: true,
      group: 'physical',
    },
    // 线缆参数组
    {
      key: 'cable_type',
      label: '线缆类型',
      type: 'select',
      options: [
        { value: 'PVC', label: 'PVC柔性电缆' },
        { value: 'PUR', label: 'PUR拖链电缆' },
      ],
      required: true,
      group: 'cable',
    },
    {
      key: 'cable_spec',
      label: '线缆规格',
      type: 'text',
      placeholder: '10×0.25mm²',
      group: 'cable',
    },
    {
      key: 'cable_length',
      label: '线缆长度',
      type: 'select',
      options: ['3m', '5m', '10m'],
      group: 'cable',
    },
    {
      key: 'halogen_free',
      label: '无卤素',
      type: 'boolean',
      default: true,
      group: 'cable',
    },
    // 颜色编码组
    {
      key: 'wire_colors',
      label: '线缆颜色编码',
      type: 'json',
      description: 'JSON格式定义各引脚线缆颜色',
      group: 'wiring',
    },
  ],
  groups: [
    { key: 'electrical', label: '电气参数', order: 1 },
    { key: 'physical', label: '物理参数', order: 2 },
    { key: 'cable', label: '线缆参数', order: 3 },
    { key: 'wiring', label: '接线定义', order: 4, collapsible: true },
  ],
  version: 1,
};

// ============================================================================
// 主函数
// ============================================================================

async function main() {
  console.log('🌱 开始填充数据库...');

  // 创建 M8 Compact 系列
  const m8CompactSeries = await prisma.series.upsert({
    where: { code: 'M8-COMPACT-4-6' },
    update: {},
    create: {
      name: 'M8 Compact 4/6 Ports',
      code: 'M8-COMPACT-4-6',
      description: 'M8紧凑型分线盒，带M12预装插头，适用于4/6端口配置',
      templateId: 'layout-m8-standard',
      schemaDefinition: M8_COMPACT_SCHEMA,
      layoutConfig: {
        pageSize: 'A4',
        orientation: 'portrait',
        showHeader: true,
        showFooter: true,
      },
      isActive: true,
      sortOrder: 1,
    },
  });

  console.log(`✅ 创建系列: ${m8CompactSeries.name}`);

  // 创建 M8 Distributor 系列
  const m8DistributorSeries = await prisma.series.upsert({
    where: { code: 'M8-DISTRIBUTOR-8-12' },
    update: {},
    create: {
      name: 'M8 Distributor 8/12 Ports',
      code: 'M8-DISTRIBUTOR-8-12',
      description: 'M8分线器，带线缆出线，适用于8/12端口配置',
      templateId: 'layout-m8-distributor',
      schemaDefinition: M8_DISTRIBUTOR_SCHEMA,
      layoutConfig: {
        pageSize: 'A4',
        orientation: 'portrait',
        showHeader: true,
        showFooter: true,
      },
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log(`✅ 创建系列: ${m8DistributorSeries.name}`);

  // 创建示例产品 - M8 Compact 4端口
  const product1 = await prisma.product.upsert({
    where: { sku: 'M8C4-STD-001' },
    update: {},
    create: {
      name: 'M8 Compact 4 Ports 标准型',
      sku: 'M8C4-STD-001',
      description: 'M8紧凑型4端口分线盒，带M12预装插头',
      seriesId: m8CompactSeries.id,
      specifications: {
        voltage_rating: '24V DC/AC',
        working_voltage: '16...30V DC',
        current_load: 2,
        total_current: 6,
        port_count: '4',
        ip_rating: 'IP67',
        channel_type: 'single',
        led_power_color: 'green',
        led_signal_color: 'yellow',
      },
      pinDefinitions: {
        connector_type: 'M8',
        pins: [
          { pin: 1, name: '+V', function: '电源正极', color: 'BROWN' },
          { pin: 3, name: '-V', function: '电源负极', color: 'BLUE' },
          { pin: 4, name: 'ISO', function: '信号输出', color: 'BLACK' },
        ],
      },
      status: 'PUBLISHED',
      version: 1,
    },
  });

  console.log(`✅ 创建产品: ${product1.name}`);

  // 创建产品型号
  const partNumbers = [
    { partNumber: '8HT-TB-HBS-4CS,-N-M12', category: 'NPN' },
    { partNumber: '8HT-TB-HBS-4CS,-P-M12', category: 'PNP' },
    { partNumber: '8HT-TB-HBS-4CS,-W-M12', category: 'NO_LED' },
  ];

  for (const pn of partNumbers) {
    await prisma.partNumber.upsert({
      where: {
        productId_partNumber: {
          productId: product1.id,
          partNumber: pn.partNumber,
        },
      },
      update: {},
      create: {
        productId: product1.id,
        partNumber: pn.partNumber,
        category: pn.category,
        variantConfig: {
          signal_type: pn.category,
        },
        isActive: true,
      },
    });
  }

  console.log(`✅ 创建型号: ${partNumbers.length} 个`);

  // 创建示例产品 - M8 Distributor 8端口
  const product2 = await prisma.product.upsert({
    where: { sku: 'M8D8-PVC-001' },
    update: {},
    create: {
      name: 'M8 Distributor 8 Ports PVC',
      sku: 'M8D8-PVC-001',
      description: 'M8分线器8端口，PVC柔性电缆，PCB端子出线',
      seriesId: m8DistributorSeries.id,
      specifications: {
        voltage_rating: '24V DC/AC',
        working_voltage: '18–30V DC',
        current_load: 2,
        total_current: 6,
        port_count: '8',
        ip_rating: 'IP67',
        cable_type: 'PVC',
        cable_spec: '10×0.25mm²',
        cable_length: '3m',
        halogen_free: true,
        wire_colors: [
          { pin: 1, color: 'BLUE' },
          { pin: 2, color: 'BROWN' },
          { pin: 3, color: 'WHITE' },
          { pin: 4, color: 'GREEN' },
          { pin: 5, color: 'YELLOW' },
          { pin: 6, color: 'GRAY' },
          { pin: 7, color: 'PINK' },
          { pin: 8, color: 'RED' },
        ],
      },
      status: 'PUBLISHED',
      version: 1,
    },
  });

  console.log(`✅ 创建产品: ${product2.name}`);

  // 创建分线器型号
  await prisma.partNumber.upsert({
    where: {
      productId_partNumber: {
        productId: product2.id,
        partNumber: 'RH7-M8-8C/L-F9-PCB10P-3-35GY',
      },
    },
    update: {},
    create: {
      productId: product2.id,
      partNumber: 'RH7-M8-8C/L-F9-PCB10P-3-35GY',
      category: 'PVC',
      variantConfig: {
        cable_type: 'PVC',
        cable_length: '3m',
      },
      isActive: true,
    },
  });

  await prisma.partNumber.upsert({
    where: {
      productId_partNumber: {
        productId: product2.id,
        partNumber: 'RH7-M8-8C/L-F9-PCB10P-3-35GY-PUR',
      },
    },
    update: {},
    create: {
      productId: product2.id,
      partNumber: 'RH7-M8-8C/L-F9-PCB10P-3-35GY-PUR',
      category: 'PUR',
      variantConfig: {
        cable_type: 'PUR',
        cable_length: '3m',
      },
      isActive: true,
    },
  });

  console.log('✅ 创建分线器型号: 2 个');

  // 创建示例审计日志
  await prisma.auditLog.create({
    data: {
      entityType: 'Product',
      entityId: product1.id,
      userId: 'seed-user',
      userEmail: 'admin@example.com',
      userName: 'System Admin',
      action: 'CREATE',
      summary: '创建产品: M8 Compact 4 Ports 标准型',
      newValue: {
        name: product1.name,
        sku: product1.sku,
      },
    },
  });

  console.log('✅ 创建审计日志');

  console.log('\n🎉 数据库填充完成！');
  console.log(`   - 系列: 2 个`);
  console.log(`   - 产品: 2 个`);
  console.log(`   - 型号: 5 个`);
}

main()
  .catch((e) => {
    console.error('❌ 填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

