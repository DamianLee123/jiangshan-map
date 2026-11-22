#!/usr/bin/env node
/**
 * Generates js/xingji/maozedong_journey.js from the approved 星火燎原 pack (1893–1949).
 * Run: node scripts/xingji/build_maozedong_pack.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'js/xingji/maozedong_journey.js');

const journey = {
  key: 'maozedong',
  dynastyKey: 'roc',
  color: '#c41e24',
  shortZh: '星火燎原',
  shortEn: 'Mao Zedong',
  titleZh: '毛泽东「星火燎原」公开行迹',
  titleEn: 'Mao Zedong — Sparks of Revolution (Public Trajectory)',
  spanZh: '1893年 — 1949年（收束于开国大典）',
  spanEn: '1893 CE – 1949 CE (through the founding ceremony)',
  xingji: {
    epithetZh: '星火燎原',
    epithetEn: 'Sparks of Revolution',
    stages: 12,
    inflections: 25,
    reviewStatus: 'pending',
  },
  stops: [],
};

function stop(
  year,
  coord,
  ancientZh,
  modernZh,
  nodeTitleZh,
  opts = {}
) {
  const month = opts.month ?? 6;
  const via = opts.via;
  const certainty = opts.certainty || '';
  const modern = certainty ? `${modernZh}（${certainty}）` : modernZh;
  return {
    year,
    month,
    coord,
    dynastyKey: opts.dynastyKey || (year < 1912 ? 'qing' : year < 1949 ? 'roc' : 'prc'),
    labelPos: opts.labelPos || 'bottom',
    ancientZh,
    modernZh: modern,
    ancientEn: opts.ancientEn || ancientZh,
    modernEn: opts.modernEn || modernZh,
    titleZh: nodeTitleZh,
    titleEn: opts.titleEn || nodeTitleZh,
    descZh: opts.descZh || nodeTitleZh,
    descEn: opts.descEn || nodeTitleZh,
    ...(via ? { via } : {}),
    xingji: {
      nodeTitleZh: nodeTitleZh,
      inflection: Boolean(opts.inflection),
      stageId: opts.stageId || null,
      stageTitleZh: opts.stageTitleZh || null,
      stageTimeZh: opts.stageTimeZh || null,
      stageSummaryZh: opts.stageSummaryZh || null,
      sourcesZh: opts.sourcesZh || null,
      certainty: certainty || null,
    },
  };
}

// 壹
journey.stops.push(
  stop(1893, [112.526, 27.915], '韶山冲', '湖南韶山', '韶山冲上屋场', {
    month: 12.26,
    certainty: '约',
    inflection: true,
    stageId: 1,
    stageTitleZh: '韶山启蒙',
    stageTimeZh: '1893年12月26日出生；1902—1909年在家乡私塾读书',
    stageSummaryZh:
      '毛泽东诞生在湘潭县韶山冲的一个农民家庭。1902年至1909年，先后在家乡韶山六所私塾读书，接受中国传统的启蒙教育。这是他作为乡间书生的起点。',
    sourcesZh: ['人民网《毛泽东生平年表（1893—1925 年）》', '《毛泽东年谱》'],
  })
);

// 贰
journey.stops.push(
  stop(1910, [112.528, 27.92], '韶山', '湖南韶山', '离乡赴湘乡', {
    month: 9,
    certainty: '约',
    via: [[112.54, 27.82]],
  }),
  stop(1910, [112.551, 27.734], '湘乡县立东山高等小学堂', '湖南湘乡', '东山高等小学堂', {
    month: 10,
    inflection: true,
    stageId: 2,
    stageTitleZh: '东山求学',
    stageTimeZh: '1910年秋',
    stageSummaryZh:
      '1910年秋，他离开韶山，考入湘乡县立东山高等小学堂。这是第一次离乡求学。在此期间受康有为、梁启超改良主义思想的影响。',
    sourcesZh: ['人民网《毛泽东生平年表（1893—1925 年）》'],
  })
);

// 叁
journey.stops.push(
  stop(1911, [112.982, 28.198], '湘乡驻省中学', '湖南长沙', '湘乡驻省中学', {
    month: 3,
    inflection: true,
    stageId: 3,
    stageTitleZh: '入长沙就学',
    stageTimeZh: '1911年春',
    stageSummaryZh:
      '1911年春，他到长沙，考入湘乡驻省中学。其间读到同盟会办的《民立报》，撰文表示拥护孙中山及同盟会的纲领。书生求学由此进入省城学堂。',
    sourcesZh: ['人民网《毛泽东生平年表（1893—1925 年）》'],
  }),
  stop(1911, [112.982, 28.198], '长沙', '湖南长沙', '湖南新军列兵', {
    month: 10,
    inflection: true,
    stageId: 3,
    stageTitleZh: '投笔从戎',
    stageTimeZh: '1911年10月入伍，约半年后退出',
    stageSummaryZh:
      '1911年10月，他响应辛亥革命，投笔从戎，在湖南新军当列兵。这是公开记载中第一次从军。约半年后退出，之后重新入学。',
    sourcesZh: ['人民网《毛泽东生平年表（1893—1925 年）》'],
  })
);

// 肆
journey.stops.push(
  stop(1913, [112.982, 28.198], '湖南省立第四师范', '湖南长沙', '第四师范预科', { month: 3 }),
  stop(1914, [112.982, 28.198], '湖南省立第一师范学校', '湖南长沙', '第一师范本科', { month: 9 }),
  stop(1918, [112.982, 28.198], '长沙', '湖南长沙', '新民学会成立', {
    month: 4.5,
    inflection: true,
    stageId: 4,
    stageTitleZh: '进入一师',
    stageTimeZh: '1913年春—1918年6月毕业',
    stageSummaryZh:
      '1913年春，他入湖南省立第四师范学校预科。1914年秋，该校合并后，编入湖南省立第一师范学校本科第八班。在校期间受杨昌济等进步教师影响，成为《新青年》的热心读者。1918年4月14日，与萧子升、何叔衡、蔡和森等发起成立新民学会；同年6月在一师毕业。这是他青年求学时间最长、影响最深的阶段。',
    sourcesZh: ['人民网《毛泽东生平年表（1893—1925 年）》'],
  })
);

// 伍
journey.stops.push(
  stop(1918, [116.31, 39.992], '北京大学图书馆', '北京', '北京大学图书馆', {
    month: 8,
    inflection: true,
    stageId: 5,
    stageTitleZh: '第一次到北京',
    stageTimeZh: '1918年8月至1919年春',
    stageSummaryZh:
      '1918年8月，为组织湖南赴法勤工俭学运动，他第一次到北京，担任北京大学图书馆管理员，得到李大钊等人帮助，开始接受俄国十月革命的思想影响。1919年4月6日从上海回到长沙，随后响应五四运动，发起成立湖南学生联合会，并主编《湘江评论》，发表《民众的大联合》。',
    sourcesZh: ['人民网《毛泽东生平年表（1893—1925 年）》'],
    via: [[114.8, 32.5], [121.47, 31.23]],
  }),
  stop(1919, [112.982, 28.198], '长沙', '湖南长沙', '长沙《湘江评论》', { month: 7 }),
  stop(1919, [116.31, 39.992], '北京', '北京', '第二次到北京', { month: 12, certainty: '约' }),
  stop(1920, [121.473, 31.231], '上海', '上海', '上海会见陈独秀', { month: 5.5 }),
  stop(1920, [112.982, 28.198], '长沙', '湖南长沙', '长沙共产主义小组', { month: 11 }),
  stop(1921, [121.473, 31.231], '上海', '上海', '中共一大', {
    month: 7.5,
    inflection: true,
    stageId: 5,
    stageTitleZh: '出席中共一大',
    stageTimeZh: '1921年7月23日至8月初',
    stageSummaryZh:
      '1920年11月，他与何叔衡等组织长沙共产主义小组；同年12月在致蔡和森等人的信中表明自己接受马克思主义，走俄国十月革命的道路。1921年7月23日至8月初，他与何叔衡作为长沙共产主义小组的代表，出席在上海召开的中国共产党第一次全国代表大会。会后回长沙，建立中共湖南支部并任书记。',
    sourcesZh: ['人民网《毛泽东生平年表（1893—1925 年）》'],
  }),
  stop(1921, [112.982, 28.198], '长沙', '湖南长沙', '中共湖南支部', { month: 9 })
);

// 陆
journey.stops.push(
  stop(1926, [113.264, 23.129], '广州农民运动讲习所', '广东广州', '广州农民运动讲习所', { month: 5 }),
  stop(1927, [112.982, 28.198], '湖南', '湖南五县', '湖南五县农运考察', { month: 2, certainty: '约' }),
  stop(1927, [114.305, 30.593], '汉口', '湖北武汉', '汉口八七会议', {
    month: 8.2,
    inflection: true,
    stageId: 6,
    stageTitleZh: '八七会议',
    stageTimeZh: '1927年8月7日',
    stageSummaryZh:
      '大革命失败前后，他先在湖南考察农民运动，于1927年3月发表《湖南农民运动考察报告》。同年4月12日和7月15日，蒋介石、汪精卫相继背叛革命。8月7日，他出席中共中央在汉口召开的紧急会议（八七会议），提出枪杆子里面出政权的思想，被选为临时中央政治局候补委员。会后到湖南领导湘赣边界秋收起义。由此，公开轨迹从农运和党内工作转入独立领导武装斗争。',
    sourcesZh: ['人民网《毛泽东生平年表（1926—1931 年）》', '《中国共产党一百年大事记》'],
  })
);

// 柒
journey.stops.push(
  stop(1927, [113.625, 28.161], '浏阳', '湖南浏阳', '秋收起义爆发', {
    month: 9.3,
    certainty: '约',
    inflection: true,
    stageId: 7,
    stageTitleZh: '秋收起义',
    stageTimeZh: '1927年9月9日爆发',
    stageSummaryZh:
      '1927年9月9日，以毛泽东为书记的中共湖南省委前敌委员会，领导工农革命军第一师发动湘赣边界秋收起义。起义受挫后，他率部放弃继续进攻中心城市，改向罗霄山脉中段进军。这是他领导创建人民军队武装的起点。',
    sourcesZh: ['人民网《毛泽东生平年表（1926—1931 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1927, [113.68, 28.35], '浏阳张家坊', '湖南浏阳', '浏阳张家坊脱险', { month: 9.2, certainty: '约' }),
  stop(1927, [114.2, 27.1], '罗霄山脉', '湘赣边界', '向罗霄山脉中段进军', { month: 9.5, certainty: '约' }),
  stop(1927, [114.04, 26.951], '三湾', '江西永新', '三湾改编', {
    month: 9.95,
    inflection: true,
    stageId: 7,
    stageTitleZh: '三湾改编',
    stageTimeZh: '1927年9月29日',
    stageSummaryZh:
      '9月29日，起义军到达江西永新三湾村，进行改编：缩编部队，把党的支部建在连上，并建立士兵委员会，从组织上确立党对军队的领导。这是建设无产阶级领导的新型人民军队的重要开端，也是部队历程中的第一个重大转折。',
    sourcesZh: ['《中国共产党一百年大事记》', '中共中央党史和文献研究院关于三湾改编的公开记述'],
  })
);

// 捌
journey.stops.push(
  stop(1927, [114.17, 26.58], '茅坪', '江西宁冈', '宁冈茅坪', {
    month: 10.2,
    certainty: '约',
    inflection: true,
    stageId: 8,
    stageTitleZh: '创建井冈山根据地',
    stageTimeZh: '1927年10月',
    stageSummaryZh:
      '1927年10月，起义军到达江西宁冈县茅坪，开始创建井冈山革命根据地。这是党的第一个农村革命根据地，标志着从攻打城市转向在农村实行工农武装割据。',
    sourcesZh: ['人民网《毛泽东生平年表（1926—1931 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1928, [114.05, 26.75], '砻市', '江西井冈山', '砻市会师', {
    month: 4.5,
    certainty: '约',
    inflection: true,
    stageId: 8,
    stageTitleZh: '井冈山会师',
    stageTimeZh: '1928年4月',
    stageSummaryZh:
      '1928年4月，他率部在宁冈砻市同朱德、陈毅率领的南昌起义军余部和湘南起义农军会师。5月，两支部队合编为工农革命军（后改称中国红军）第四军，朱德任军长，他任党代表、军委书记。其后提出「工农武装割据」思想，并主持制定井冈山《土地法》。',
    sourcesZh: ['人民网《毛泽东生平年表（1926—1931 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1928, [114.17, 26.58], '井冈山', '江西井冈山', '工农武装割据', { month: 10 })
);

// 玖
journey.stops.push(
  stop(1929, [114.17, 26.58], '井冈山', '江西井冈山', '离开井冈山', { month: 1.2 }),
  stop(1930, [116.0, 26.2], '赣南闽西', '江西南部、福建西部', '赣南闽西根据地', {
    month: 3,
    certainty: '约',
    inflection: true,
    stageId: 9,
    stageTitleZh: '进军赣南闽西',
    stageTimeZh: '1929年1月起至1930年春',
    stageSummaryZh:
      '1929年1月，他与朱德、陈毅率红四军主力离开井冈山，向赣南、闽西进军。至1930年春，赣南、闽西两块革命根据地初步形成，后来连成一片，发展成为中央革命根据地。',
    sourcesZh: ['人民网《毛泽东生平年表（1926—1931 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1929, [116.82, 25.049], '古田', '福建上杭', '古田会议', {
    month: 12,
    inflection: true,
    stageId: 9,
    stageTitleZh: '古田会议',
    stageTimeZh: '1929年12月',
    stageSummaryZh:
      '1929年12月，他在上杭古田主持召开中共红四军第九次代表大会，作政治报告并起草大会决议案（古田会议决议）。决议明确红军是执行革命政治任务的武装集团，奠定了党对军队绝对领导等建军原则。这是部队建设史上的重大拐点。',
    sourcesZh: ['人民网《毛泽东生平年表（1926—1931 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1931, [116.027, 25.885], '瑞金', '江西瑞金', '三次反「围剿」', { month: 6 }),
  stop(1931, [116.027, 25.885], '瑞金', '江西瑞金', '瑞金', {
    month: 11,
    inflection: true,
    stageId: 9,
    stageTitleZh: '中华苏维埃在瑞金成立',
    stageTimeZh: '1931年11月',
    stageSummaryZh:
      '1930年12月至1931年9月，他与朱德等指挥红一方面军连续粉碎国民党军第一、二、三次「围剿」。1931年11月，在中华苏维埃第一次全国代表大会后，于中央执行委员会第一次会议上当选为中华苏维埃共和国中央执行委员会主席和人民委员会主席。需同时写明：同年11月初的赣南会议上，他曾受到「狭隘的经验论」等错误指责并遭到排挤。',
    sourcesZh: ['人民网《毛泽东生平年表（1926—1931 年）》'],
  })
);

// 拾
journey.stops.push(
  stop(1934, [115.415, 25.952], '于都', '江西于都', '离开于都', {
    month: 10.6,
    inflection: true,
    stageId: 10,
    stageTitleZh: '踏上长征',
    stageTimeZh: '1934年10月',
    stageSummaryZh:
      '由于第五次反「围剿」失利，中央红军开始战略转移。据《毛泽东生平年表》，1934年10月18日傍晚，他带领警卫班离开于都城，踏上长征路途。中央机关出发日期在不同公开综述中或写作10月10日前后自瑞金等地转移，本稿两说并列，不以某一时刻为精确实测。11月底湘江之战中红军损失惨重。12月12日，在湖南通道的中共中央负责人紧急会议上，他力主放弃原定与红二、红六军团会合的计划，改向敌人力量较弱的贵州前进，意见被采纳。',
    sourcesZh: ['人民网《毛泽东生平年表（1932—1936 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1934, [111.07, 25.93], '湘江', '广西全州', '湘江之战', { month: 11.8 }),
  stop(1934, [109.78, 26.15], '通道', '湖南通道', '通道转兵', { month: 12.4, certainty: '约' }),
  stop(1935, [106.92, 27.7], '遵义', '贵州遵义', '遵义会议', {
    month: 1.5,
    inflection: true,
    stageId: 10,
    stageTitleZh: '遵义会议',
    stageTimeZh: '1935年1月15日至17日',
    stageSummaryZh:
      '中央政治局在遵义召开扩大会议，集中解决当时具有决定意义的军事和组织问题，增选毛泽东为中央政治局常委。会议结束了王明「左」倾冒险主义在中共中央的统治，实际确立了以毛泽东为代表的新的中央领导。这是党的历史上一个生死攸关的转折点，也是他在全军指挥地位上的关键拐点。3月，他与周恩来、王稼祥组成三人军事指挥小组。此后至5月，指挥红一方面军四渡赤水，巧渡金沙江，飞夺泸定桥，取得战略转移中具有决定意义的胜利。',
    sourcesZh: ['人民网《毛泽东生平年表（1932—1936 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1935, [106.2, 28.33], '习水', '贵州习水', '四渡赤水', { month: 2.5 }),
  stop(1935, [108.18, 36.93], '吴起镇', '陕西吴起', '吴起镇', {
    month: 10.6,
    inflection: true,
    stageId: 10,
    stageTitleZh: '落脚陕北',
    stageTimeZh: '1935年10月19日',
    stageSummaryZh:
      '1935年6月，红一方面军与红四方面军在四川西部会合后，他同张国焘的逃跑主义、分裂主义进行了斗争。10月19日，他率领中国工农红军陕甘支队到达陕西保安吴起镇，中央红军完成长征。12月，瓦窑堡会议确定建立抗日民族统一战线的策略。',
    sourcesZh: ['人民网《毛泽东生平年表（1932—1936 年）》'],
    via: [[106.5, 34.2], [107.2, 35.5]],
  }),
  stop(1935, [109.48, 37.36], '瓦窑堡', '陕西子长', '瓦窑堡会议', { month: 12.5 })
);

// 拾壹
journey.stops.push(
  stop(1936, [109.49, 36.59], '延安', '陕西延安', '西安事变方针', {
    month: 12.2,
    descZh: '决策在陕北，谈判在西安；本人驻地不按亲赴西安记载。',
  }),
  stop(1937, [109.49, 36.59], '延安', '陕西延安', '进驻延安', {
    month: 1.4,
    inflection: true,
    stageId: 11,
    stageTitleZh: '进驻延安',
    stageTimeZh: '1937年1月13日',
    stageSummaryZh:
      '1936年12月7日，他任中共中央革命军事委员会主席。同月，张学良、杨虎城在西安实行「兵谏」后，他和中共中央确定和平解决西安事变的方针，派周恩来等往西安参加谈判。1937年1月13日，他同中共中央和中央军委进驻延安。延安此后成为抗战时期的指挥中枢。',
    sourcesZh: ['人民网《毛泽东生平年表（1932—1936 年）》', '人民网《毛泽东生平年表（1937—1940 年）》'],
  }),
  stop(1937, [109.43, 35.762], '洛川', '陕西洛川', '洛川会议', {
    month: 8.5,
    inflection: true,
    stageId: 11,
    stageTitleZh: '洛川会议与红军改编',
    stageTimeZh: '1937年8月22日至25日',
    stageSummaryZh:
      '全国抗日战争开始后，他于8月22日至25日出席洛川召开的中共中央政治局扩大会议，强调统一战线中的独立自主原则，阐明独立自主山地游击战的战略方针，任新组成的中共中央军事委员会书记。8月25日，与朱德、周恩来联名发布红军改编为国民革命军第八路军的命令，随后指导八路军开赴抗日前线。1938年5月26日至6月3日，他在延安作《论持久战》讲演，阐明持久战的总方针。',
    sourcesZh: ['人民网《毛泽东生平年表（1937—1940 年）》'],
  }),
  stop(1937, [109.49, 36.59], '延安', '陕西延安', '八路军改编出师', { month: 8.9 }),
  stop(1938, [109.49, 36.59], '延安', '陕西延安', '《论持久战》', { month: 5.5 }),
  stop(1945, [109.49, 36.59], '延安', '陕西延安', '中共七大', {
    month: 4.5,
    inflection: true,
    stageId: 11,
    stageTitleZh: '中共七大',
    stageTimeZh: '1945年4—6月',
    stageSummaryZh:
      '他主持召开中国共产党第七次全国代表大会，致开幕词和闭幕词，并向大会提交《论联合政府》书面政治报告。大会确定以毛泽东思想作为全党一切工作的指针。6月19日，在七届一中全会上当选为中央委员会主席。这是抗战胜利前夜党在政治上、组织上的重大拐点。',
    sourcesZh: ['人民网《毛泽东生平年表（1941—1945 年）》', '《中国共产党一百年大事记》'],
  }),
  stop(1945, [106.55, 29.56], '重庆', '重庆', '重庆谈判', {
    month: 8.9,
    inflection: true,
    stageId: 11,
    stageTitleZh: '重庆谈判',
    stageTimeZh: '1945年8月28日至10月11日',
    stageSummaryZh:
      '日本投降前后，他于8月13日提出对国民党实行针锋相对、寸土必争的方针。8月28日，赴重庆同蒋介石进行和平谈判。10月10日，《国民政府与中共代表会谈纪要》（《双十协定》）在重庆签署；11日，他回到延安。这是抗战胜利后由战争转向谈判、再转入国内局势新阶段的公开拐点。',
    sourcesZh: ['人民网《毛泽东生平年表（1941—1945 年）》'],
    via: [[108.9, 34.5]],
  }),
  stop(1945, [109.49, 36.59], '延安', '陕西延安', '返回延安', { month: 10.4 })
);

// 拾贰
journey.stops.push(
  stop(1947, [109.49, 36.59], '延安', '陕西延安', '撤离延安', { month: 3.6 }),
  stop(1947, [109.2, 37.5], '陕北', '陕北一带', '转战陕北', {
    month: 5,
    certainty: '约',
    inflection: true,
    stageId: 12,
    stageTitleZh: '转战陕北',
    stageTimeZh: '1947年3月18日起，历时约一年',
    stageSummaryZh:
      '1946年6月26日全面内战爆发后，1947年3月18日，他率中共中央机关和人民解放军总部撤离延安，开始历时一年的陕北转战。3月至8月，领导西北野战军取得青化砭、羊马河、蟠龙、沙家店等战役胜利，粉碎国民党对陕北的重点进攻，并部署刘邓、陈粟、陈谢三路大军转入战略进攻。',
    sourcesZh: ['人民网《毛泽东生平年表（1946—1950 年）》'],
  }),
  stop(1948, [110.45, 37.0], '陕北', '陕北', '东渡黄河', { month: 3.3, certainty: '约' }),
  stop(1948, [114.2, 38.33], '西柏坡', '河北平山', '西柏坡', {
    month: 5.9,
    inflection: true,
    stageId: 12,
    stageTitleZh: '西柏坡与三大战役',
    stageTimeZh: '1948年5月27日到达；1948年9月至1949年1月运筹指挥',
    stageSummaryZh:
      '1948年3月23日，他结束陕北转战，东渡黄河。5月27日到达中共中央工委所在地河北平山县西柏坡村。9月至次年1月，在此组织指挥辽沈、淮海、平津三大战略决战，将国民党军主力聚歼在长江以北。西柏坡是解放战争后期的指挥枢纽。（指挥地在此；不将各战场标为亲履。）',
    sourcesZh: ['人民网《毛泽东生平年表（1946—1950 年）》'],
  }),
  stop(1948, [114.2, 38.33], '西柏坡', '河北平山', '三大战役', {
    month: 9,
    descZh: '在西柏坡运筹指挥辽沈、淮海、平津，非亲临各战场。',
  }),
  stop(1949, [116.4, 39.9], '北平', '北京', '进驻北平', { month: 3.9 }),
  stop(1949, [116.397, 39.908], '北平', '北京', '开国大典', {
    month: 10.1,
    inflection: true,
    stageId: 12,
    stageTitleZh: '进京开国',
    stageTimeZh: '1949年10月1日',
    stageSummaryZh:
      '1949年3月，他主持召开中共七届二中全会，提出党的工作重心转移和建国指导方针。3月25日，率中共中央机关和人民解放军总部进驻北平。4月21日，与朱德联名发布《向全国进军的命令》；23日人民解放军占领南京。9月，出席中国人民政治协商会议第一届全体会议，当选中央人民政府主席。10月1日，中华人民共和国成立，他主持开国大典。本条「从书生到从军」的脉络在此收束。',
    sourcesZh: ['人民网《毛泽东生平年表（1946—1950 年）》'],
  })
);

const infCount = journey.stops.filter((s) => s.xingji && s.xingji.inflection).length;
if (infCount !== 25) {
  console.error(`Expected 25 inflections, got ${infCount}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const body = `/* AUTO-GENERATED by scripts/xingji/build_maozedong_pack.js — 星火燎原 pack */
(function () {
  window.XINGJI_MAO_JOURNEY = ${JSON.stringify(journey, null, 2)};
})();
`;
fs.writeFileSync(OUT, body, 'utf8');
console.log(`Wrote ${OUT}: ${journey.stops.length} stops, ${infCount} inflections`);