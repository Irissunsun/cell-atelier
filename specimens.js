export const specimens={
 'animal-cell':{en:'Animal Cell',zh:'动物细胞',sub:'真核生物',icon:'◉',color:'#9865a9',description:'一个微小而完整的世界。',keys:['nucleus','mitochondria','er','golgi','membrane','fibers','centrioles','vesicles','ribosomes'],hidden:['membrane','cytoplasm']},
 'plant-cell':{en:'Plant Cell',zh:'植物细胞',sub:'叶肉细胞示意',icon:'▧',color:'#748e49',description:'绿色的能量工厂，藏在每一片叶子里。',keys:['nucleus','chloroplast','vacuole','wall','membrane','mitochondria','er'],hidden:['wall','membrane','cytoplasm']},
 'white-blood-cell':{en:'White Blood Cell',zh:'白细胞',sub:'中性粒细胞示意',icon:'◌',color:'#8b80a5',description:'以分叶细胞核为特征的免疫细胞。',keys:['nucleus','vesicles','mitochondria','membrane'],hidden:['membrane','cytoplasm']},
 neuron:{en:'Neuron',zh:'神经元',sub:'有髓神经元示意',icon:'✳',color:'#7899a3',description:'沿着分支与轴突，探索信息传递的路径。',keys:['nucleus','dendrites','axon','myelin','terminals','membrane'],hidden:['membrane'],camera:[0,10,8]},
};
// Scope is visible to learners: omitted structures must not imply absence.
Object.assign(specimens['animal-cell'],{camera:[3.6,6.5,8.8],omitted:'未展示：溶酶体、过氧化物酶体等。线粒体、细胞核及细胞膜采用剖切示意；中心粒展示为近似垂直的一对。膜褶皱与颗粒尺寸经过放大。'});
Object.assign(specimens['plant-cell'],{
 camera:[4,7,9.5],keys:['nucleus','chloroplast','vacuole','wall','membrane','mitochondria','er','golgi','ribosomes'],
 omitted:'以成熟叶肉细胞为参考。中央液泡占据较大空间，其他结构主要分布在周围细胞质中；细胞器为便于观察经过放大。未展示过氧化物酶体、胞间连丝等。上方剖切不代表天然开口。',
 entries:{
  er:['内质网','Endoplasmic reticulum','#8b69a6','位于细胞核附近的膜性管道与囊腔系统。本模型展示附着核糖体的粗面内质网片层。','参与蛋白质合成、加工及胞内运输','与核膜相关联的膜性结构','紫色褶皱片层示意粗面内质网，表面浅色小颗粒为核糖体。未单独展示光面内质网。'],
  golgi:['高尔基体','Golgi apparatus','#c87e96','植物细胞也具有高尔基体，可参与蛋白质的加工运输以及某些细胞壁多糖的合成。','加工、分类和运输物质','堆叠的扁平膜囊及周围囊泡','粉色层叠膜囊位于细胞核左侧，周围小球为运输囊泡示意。'],
  chloroplast:['叶绿体','Chloroplast','#608443','叶绿体是叶肉细胞进行光合作用的细胞器。内部类囊体堆叠成基粒，基粒之间有基质片层连接。','进行光合作用','双层包膜、基质与类囊体膜系统','深浅两层绿色壳体示意包膜剖面，黄绿色圆片堆叠表示基粒，细连接表示基质片层。膜厚与数量均经过简化。'],
  wall:['细胞壁','Cell wall','#7c934d','位于细胞膜外侧，主要含纤维素等多糖，为植物细胞提供支持和保护。','支持和保护细胞','有一定厚度且与细胞膜不同的外层结构','外侧连续绿色壁面及较厚切边为细胞壁；里面更薄的浅绿色层是细胞膜。表面线条表示艺术化纹理。']
 }
});
Object.assign(specimens['white-blood-cell'],{keys:['nucleus','granules','mitochondria','membrane'],omitted:'本标本为中性粒细胞，不代表所有白细胞。未展示：内质网、高尔基体、核糖体等。'});
Object.assign(specimens.neuron,{keys:['soma','nucleus','dendrites','axon','myelin','terminals','membrane'],camera:[0,12,10],omitted:'胞体、细胞核采用剖切展示。未展示：内质网、高尔基体、线粒体、核糖体和形成髓鞘的胶质细胞等。细胞膜也包围树突和轴突，本模型仅将胞体膜独立分组。'});
for(const s of Object.values(specimens)){s.hidden=['membrane'];s.hideLabel='隐藏胞体膜';}
for(const id of ['animal-cell','plant-cell','white-blood-cell'])specimens[id].hideLabel='隐藏细胞膜';
specimens['red-blood-cell']={
 en:'Red Blood Cell',zh:'成熟红细胞',sub:'哺乳动物 · 人红细胞示意',icon:'◎',color:'#b8504f',
 description:'中央薄、周缘厚的双凹圆盘，为运输氧气而特化。',
 keys:['membrane','rbc_cytoplasm'],hidden:['membrane'],hideLabel:'隐藏细胞膜',revealOnSelect:['rbc_cytoplasm'],camera:[3.4,7,9.2],
 omitted:'人类成熟红细胞无细胞核、无线粒体，也无核糖体；这些不是模型遗漏。双面中央凹陷但不穿孔。未单独展示膜骨架、膜蛋白和血红蛋白分子；不代表所有动物的红细胞。',
 entries:{membrane:['细胞膜','Cell membrane','#b8504f','红细胞的选择性边界，与膜骨架共同帮助细胞维持形态和发生形变。','控制物质进出，维持可变形的细胞边界','以磷脂双分子层为基础，膜下有骨架支持','外表面呈双凹圆盘形，两面中央都较薄，但没有孔洞。膜厚不按真实比例；膜骨架未单独建模。']},
};

specimens['sperm-cell']={
 en:'Sperm Cell',zh:'精子细胞',sub:'人类精子 · 结构示意',icon:'◁',color:'#6f8f9d',
 description:'高度特化的生殖细胞：头部携带遗传信息，中段富集线粒体，长尾参与运动。',
 keys:['acrosome','nucleus','mitochondria','flagellum'],hidden:[],camera:[0,10.5,13.5],
 omitted:'细胞膜实际连续包围头部、中段和尾部，本模型没有把它拆成独立可选层。未单独展示轴丝“9+2”结构、外致密纤维等超微结构；形态按人类精子概括，不代表所有物种。',
 entries:{
  nucleus:['细胞核','Nucleus','#755894','精子头部的大部分空间由高度浓缩的单倍体细胞核占据，携带父方遗传信息。','携带单倍体遗传信息','染色质高度浓缩，位于头部主体','紫色椭球表示高度浓缩的细胞核；没有按真实染色质尺度展开。'],
  mitochondria:['线粒体','Mitochondria','#ce7b4e','线粒体集中分布在精子中段，围绕鞭毛轴形成线粒体鞘，参与为运动提供能量。','参与供能，支持精子运动','在中段围绕轴丝排列','橙色小体沿中段呈螺旋式分布示意；数量与尺寸经过简化。'],
 }
};

specimens.cyanobacterium={
 en:'Cyanobacterium',zh:'蓝细菌',sub:'原核生物 · 单细胞示意',icon:'◒',color:'#378b82',
 description:'没有叶绿体，也能进行光合作用。',
 keys:['nucleoid','ribosomes','thylakoids','membrane','wall','cytoplasm'],hidden:['membrane'],hideLabel:'隐藏细胞膜',camera:[3.5,8,10],
 omitted:'选取具类囊体的单细胞蓝细菌作概括示意。上方切去部分结构以展示内部，真实细胞并不敞口。没有细胞核、叶绿体和线粒体；未展示羧酶体、储存颗粒等。膜厚、DNA形态与核糖体数量均经过简化。',
 entries:{
  nucleoid:['拟核（DNA集中区域）','Nucleoid','#c39855','蓝细菌的遗传物质主要集中在拟核区域。拟核没有核膜包围，不是细胞核。','储存和传递遗传信息','无核膜包围的DNA集中区域','金色曲线示意DNA的折叠分布，不代表染色体的真实形状、长度或拷贝数。'],
  ribosomes:['核糖体','Ribosomes','#927494','蓝细菌具有核糖体，能够合成自身的蛋白质。原核细胞并非没有任何细胞器。','合成蛋白质','无膜结构，分散在细胞质中','紫色小颗粒为放大的核糖体；数量和尺寸不按真实比例。'],
  thylakoids:['类囊体','Thylakoids','#378b82','本示意蓝细菌的类囊体膜承载光合色素和相关反应体系，参与光合作用。它们直接分布在细胞内部，不被叶绿体包裹。','参与光合作用的光反应','细胞内的光合膜系统','绿色弧形层片表示类囊体膜，表面浅色小颗粒示意藻胆体等捕光复合体；膜厚与颗粒均经过放大。它们不是叶绿体，不同蓝细菌的膜排列存在差异。'],
  membrane:['细胞膜','Plasma membrane','#a6c4a0','细胞膜包围细胞质，位于细胞壁内侧。蓝细菌具有细胞膜，但没有包围遗传物质的核膜。','控制物质进出，维持细胞内部环境','主要由脂质和蛋白质构成','浅绿色内层表示细胞膜；隐藏此层不会隐藏细胞壁或内部的类囊体膜。'],
  wall:['细胞壁与外膜','Cell envelope','#5d8f89','蓝细菌细胞壁含肽聚糖，外侧还有外膜；与植物主要含纤维素等成分的细胞壁不同。','支持和保护细胞','含肽聚糖的细胞壁，外侧有外膜','深青色外壳合并表示细胞壁与外膜，二者未逐层拆分；不代表只有一层膜。'],
  cytoplasm:['细胞质','Cytoplasm','#bfd5c0','细胞膜内部的细胞质包含核糖体、DNA以及多种代谢相关物质。','提供多种代谢反应的环境','不含细胞核、线粒体或叶绿体','浅绿色底部表示被剖开的细胞内部空间，并非额外的一层细胞膜。']
 }
};

// Resolve specimen-specific teaching content without changing other specimens.
export function structureEntry(cellId,key,baseEntries){
 return specimens[cellId]?.entries?.[key]??extraEntries[key]??baseEntries[key];
}
export function membraneHiddenAfterSelection(cellId,key,wasHidden){
 const cell=specimens[cellId];
 if(cell.hidden.includes(key))return false;
 return cell.revealOnSelect?.includes(key)?true:wasHidden;
}
export const extraEntries={
 rbc_cytoplasm:['细胞质（含血红蛋白）','Hemoglobin-rich cytoplasm','#db8070','成熟红细胞的细胞质富含血红蛋白。血红蛋白可与氧可逆结合，参与氧气运输；细胞主要通过糖酵解获得 ATP。','携带氧气，维持细胞代谢','富含可溶性血红蛋白，无细胞核和线粒体','已自动隐藏外层细胞膜。浅红色实体表示细胞质所占空间，并不是额外的一层膜。血红蛋白不是细胞器，未用放大的颗粒冒充其真实分布。'],
 soma:['胞体','Soma','#a897bf','神经元含细胞核及多种细胞器的主体部分，不等同于细胞膜。','维持细胞代谢，参与信号整合','含细胞质、细胞核及多种细胞器','浅紫色开放壳体示意剖切后的胞体内部；并非完整细胞器清单。'],
 granules:['胞质颗粒','Cytoplasmic granules','#b3619c','中性粒细胞内的膜包裹颗粒，含有参与抗微生物防御的多种成分。','参与抗微生物防御','具有不同类型的颗粒，本图未区分','粉紫色小颗粒采用统一颜色、简化尺寸，不对应真实染色与数量。'],
 chloroplast:['叶绿体','Chloroplast','#608443','植物细胞中进行光合作用的细胞器，将光能转化为化学能。','进行光合作用','内部包含类囊体及其堆叠形成的基粒','绿色椭球中的层叠圆片是基粒的简化示意。'],
 vacuole:['中央液泡','Central vacuole','#64a8b0','成熟植物细胞中常见的大型膜性结构，液泡内含有细胞液。','储存物质，维持膨压','由液泡膜包围','蓝绿色的大囊体占据模型中央，其形态和比例经过艺术化简化。'],
 wall:['细胞壁','Cell wall','#7c934d','位于植物细胞膜外侧的结构，为细胞提供机械支持。','支持和保护细胞','主要含纤维素等多糖','绿色多层边框用来表现细胞壁的厚度。'],
 dendrites:['树突','Dendrites','#9b79ad','从神经元胞体伸出的分支结构，通常参与接收其他细胞传来的信号。','接收并整合输入信号','多级分支的突起','紫色树状分支表现树突的空间分布，并非某一特定神经元的精确重建。'],
 axon:['轴突','Axon','#bc809f','从胞体伸出的较长突起，将神经冲动传向远端。','传导动作电位','细长突起，可被髓鞘包裹','粉色轴线贯穿各段髓鞘，可单独查看其连续结构。'],
 myelin:['髓鞘','Myelin sheath','#91b5b7','围绕部分轴突的多层膜结构，由胶质细胞形成。','提高神经冲动传导效率','分节包裹轴突，节间留有间隙','浅蓝色分段外套为髓鞘示意，间隙对应郎飞结所在区域。'],
 terminals:['轴突末梢','Axon terminals','#a777b1','轴突远端的分支及终末结构，可通过突触与其他细胞通信。','向其他细胞传递信号','末端分支及突触终末','右侧带小球的紫色分支表现轴突终末。'],
 acrosome:['顶体','Acrosome','#d9878f','位于精子头部前端的帽状结构，由高尔基体相关囊泡发育形成，含有参与受精过程的多种蛋白质。','参与精卵识别与受精过程','覆盖精子头部前端的帽状囊性结构','珊瑚粉色前帽为顶体的形态示意，比例经过放大以便观察。'],
 flagellum:['鞭毛（尾部）','Flagellum','#6f9eaa','从精子中段向后延伸的细长运动结构，内部轴丝由微管系统构成。','产生推进运动','细长尾部，内部含典型轴丝结构','蓝绿色细长曲线表示鞭毛整体；内部微管、纤维鞘等超微结构未逐层建模。'],
};
