const isLite = true;

// 链接元素获取
const link_libSet = document.getElementById("link_libSet");
const link_lib = document.getElementById("link_lib");
const link_classes = document.getElementById("link_classes");
const link_saa = document.getElementById("link_saa");
const link_selectCourse = document.getElementById("link_selectCourse");
const link_scloolMap = document.getElementById("link_scloolMap");
const link_serv = document.getElementById("link_serv");
const link_ee = document.getElementById("link_ee");
const link_twt = document.getElementById("link_twt");
const link_geogeba = document.getElementById("link_geogeba");
const link_cet = document.getElementById("link_cet");
const link_cg = document.getElementById("link_cg");
const link_mooc = document.getElementById("link_mooc");
const link_sso = document.getElementById("link_sso");
const link_pigai = document.getElementById("link_pigai");
const link_net = document.getElementById("link_net");
const link_netVer = document.getElementById("link_netVer");
const link_thesis = document.getElementById("link_thesis");
const link_yuclass = document.getElementById("link_yuclass");
const link_zhihuishu = document.getElementById("link_zhihuishu");
const link_party = document.getElementById("link_party");
const link_xuexitong = document.getElementById("link_xuexitong");
const link_zongce = document.getElementById("link_zongce");
const link_cstjuse = document.getElementById("link_cstjuse");
const link_xufang = document.getElementById("link_xufang");
const link_zidongceping = document.getElementById("link_zidongceping");

const footer = document.getElementById("wwww");

// 链接数据配置
const linkData = [
	{ key: link_libSet, src: "https://seatw.lib.tju.edu.cn/index.php/reserve/index.html" },
	{ key: link_lib, src: "http://www.lib.tju.edu.cn/" },
	{ key: link_classes, src: "http://classes.tju.edu.cn/eams/homeExt.action" },
	{ key: link_saa, src: "http://saa.tju.edu.cn/eams/homeExt.action" },
	{ key: link_selectCourse, src: "http://classes.tju.edu.cn/eams/stdElectCourse.action" },
	{ key: link_scloolMap, src: "http://map.tju.edu.cn/index.shtml" },
	{ key: link_serv, src: "http://serv.tju.edu.cn" },
	{ key: link_ee, src: "http://ee.tju.edu.cn/" },
	{ key: link_twt, src: "https://theory.twt.edu.cn/" },
	{ key: link_geogeba, src: "https://www.geogebra.org/calculator" },
	{ key: link_cet, src: "https://cet.neea.edu.cn" },
	{ key: link_cg, src: "https://tyapp.chingo.cn/cgapp/" },
	{ key: link_sso, src: "https://sso.tju.edu.cn/cas/login" },
	{ key: link_pigai, src: "http://www.pigai.org/" },
	{ key: link_net, src: "http://202.113.15.50:8800/?" },
	{ key: link_netVer, src: "http://202.113.5.130/srun_portal_pc?ac_id=11&theme=tju" },
	{ key: link_thesis, src: "http://121.193.132.43/thesis/" },
	{ key: link_party, src: "https://party.twt.edu.cn/" },
	{ key: link_mooc, src: "https://www.icourse163.org/" },
	{ key: link_yuclass, src: "https://changjiang.yuketang.cn/" },
	{ key: link_zhihuishu, src: "https://onlineweb.zhihuishu.com/" },
	{ key: link_xuexitong, src: "https://i.chaoxing.com/" },
	{ key: link_zongce, src: "http://172.31.126.2/user/profile" },
	{ key: link_cstjuse, src: "https://cs.tjuse.com/zh-CN/" },
	{ key: link_xufang, src: "http://172.28.45.56/" },
	{ key: link_zidongceping, src: "http://39.101.72.13/" },
];

// 复选框元素获取
const classes_s1 = document.getElementById("classes-s1");
const classes_s2 = document.getElementById("classes-s2");
const classes_s3 = document.getElementById("classes-s3");
const classes_s4 = document.getElementById("classes-s4");
const classes_s5 = document.getElementById("classes-s5");
const classes_s7 = document.getElementById("classes-s7");
const classes_s8 = document.getElementById("classes-s8");
const classes_s9 = document.getElementById("classes-s9");
const sso_s3 = document.getElementById("sso-s3");
const sso_s4 = document.getElementById("sso-s4");
const thesis_s1 = document.getElementById("thesis-s1");
const thesis_s2 = document.getElementById("thesis-s2");

// 复选框功能映射
const switchData = [
	{ key: classes_s1, fx: "autoEvaluate" },
	{ key: classes_s2, fx: "myplan_fixMeterHead" },
	{ key: classes_s3, fx: "removeFooter" },
	{ key: classes_s4, fx: "checkClassInfo" },
	{ key: classes_s5, fx: "showWeightedScore" },
	{ key: classes_s7, fx: "classes_expElect" },
	{ key: classes_s8, fx: "classes_ifameToolbar" },
	{ key: classes_s9, fx: "classes_timetablePreview" },
	{ key: sso_s3, fx: "sso_fixForm" },
	{ key: sso_s4, fx: "sso_antiWeakPwd" },
	{ key: thesis_s1, fx: "thesis_iReallyKnow" },
	{ key: thesis_s2, fx: "thesis_autoLogin" },
];

const sso_robotselect = document.getElementById("sso-robotselect");
var timer;

// 作者信息彩蛋
if (footer) {
	let i = 0;
	footer.onclick = function () {
		i++;
		setTimeout(() => i = 0, 800);
		if (i > 2) {
			const myEmail = document.createElement("a");
			myEmail.textContent = "(drizzle_cx@foxmail.com)";
			footer.appendChild(myEmail);
		}
	};
}

// 链接点击事件
linkData.forEach(item => {
	if (item.key) {
		item.key.onclick = () => window.open(item.src);
	}
});

// 控件容器阻止冒泡
document.querySelectorAll('.controls').forEach(panel => {
    panel.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// 复选框状态变更
switchData.forEach(item => {
	if (item.key) {
		item.key.onchange = function (e) {
			e.stopPropagation();
			const value = this.checked;
			chrome.storage.sync.get(["kissTJUConfig"], data => {
				const { kissTJUConfig } = data;
				if (kissTJUConfig && kissTJUConfig[item.fx]) {
					kissTJUConfig[item.fx].value = value;
					chrome.storage.sync.set({ kissTJUConfig });
				}
			});
		};

        item.key.addEventListener('click', (e) => {
            e.stopPropagation();
        });
	}
});

// 初始化配置
function init() {
	chrome.storage.sync.get(["kissTJUConfig"], data => {
		try {
			const { kissTJUConfig } = data;
			if (!kissTJUConfig) throw new Error("无配置");

			switchData.forEach(item => {
				if (item.key) item.key.checked = kissTJUConfig[item.fx].value;
			});
		} catch (e) {
			const kissTJUConfig = {
				autoEvaluate: { switch: "classes-s1", value: 0 },
				myplan_fixMeterHead: { switch: "classes-s2", value: 1 },
				removeFooter: { switch: "classes-s3", value: 1 },
				checkClassInfo: { switch: "classes-s4", value: 0 },
				showWeightedScore: { switch: "classes-s5", value: 0 },
				classes_expElect: { switch: "classes-s7", value: 1 },
				classes_ifameToolbar: { switch: "classes-s8", value: 0 },
				classes_timetablePreview: { switch: "classes-s9", value: 0 },
				sso_fixForm: { switch: "sso-s3", value: 0 },
				sso_antiWeakPwd: { switch: "sso-s4", value: 0 },
				thesis_iReallyKnow: { switch: "thesis-s1", value: 0 },
				thesis_autoLogin: { switch: "thesis-s2", value: 0 },
			};
			chrome.storage.sync.set({ kissTJUConfig });
		}
	});
}
init();

// 图标点击显示/隐藏下拉控件
document.querySelectorAll('.link-icon[data-control]').forEach(icon => {
	icon.addEventListener('click', (e) => {
		e.stopPropagation();
		const controlId = icon.getAttribute('data-control');
		const controlPanel = document.getElementById(controlId);
		if (controlPanel) {
			// 先关闭其他所有面板
			document.querySelectorAll('.controls.show').forEach(p => {
				if (p.id !== controlId) {
					p.classList.remove('show');
					document.querySelector(`.link-icon[data-control="${p.id}"]`).classList.remove('active');
				}
			});
			// 切换当前面板
			controlPanel.classList.toggle('show');
			icon.classList.toggle('active');
			
			// 关键：强制刷新body高度
			setTimeout(() => {
				document.body.style.height = 'auto';
			}, 300); // 等待过渡动画完成
		}
	});
});

// 点击空白处关闭所有控件
document.addEventListener('click', () => {
	document.querySelectorAll('.controls.show').forEach(panel => {
		panel.classList.remove('show');
	});
	document.querySelectorAll('.link-icon.active').forEach(icon => {
		icon.classList.remove('active');
	});
	
	// 关闭后重置高度
	setTimeout(() => {
		document.body.style.height = 'auto';
	}, 300);
});

// 精简版处理
if (isLite) {
	const removeList = [sso_robotselect];
	const disableList = [];

	removeList.forEach(item => {
		if (item) item.remove();
	});

	disableList.forEach(item => {
		if (item) item.setAttribute("disabled", "disabled");
	});
}

// 工具函数
function sendGetRequest(url, callback) {
	try {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4 && xhr.status === 200) {
				callback(xhr.responseText);
			}
		};
		xhr.send();
	} catch (e) {
		console.log("API请求错误");
	}
}