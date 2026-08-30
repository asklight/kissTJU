const isLite = false; //是否为精简版分支 main分支会有花里胡哨的功能 精简版会砍掉大体积的图片视频音频资源等

// `host` contains a port (for example when the campus services expose a
// temporary port), which made the exact-host dispatcher silently skip all
// features. Hostname is stable across those deployments.
const $host = window.location.hostname;
const $path = window.location.pathname;

const DEFAULT_FEATURE_CONFIG = {
	autoEvaluate: { value: 0 },
	myplan_fixMeterHead: { value: 1 },
	removeFooter: { value: 1 },
	checkClassInfo: { value: 0 },
	showWeightedScore: { value: 0 },
	classes_clickHeart: { value: 0 },
	classes_expElect: { value: 1 },
	classes_ifameToolbar: { value: 0 },
	classes_timetablePreview: { value: 0 },
	mook_jumpQuestion: { value: 0 },
	sso_fixForm: { value: 0 },
	sso_antiWeakPwd: { value: 0 },
	pigai_paste: { value: 0 },
	thesis_iReallyKnow: { value: 0 },
	thesis_autoLogin: { value: 0 },
};

function normalizeFeatureConfig(config) {
	const normalized = config && typeof config === "object" ? { ...config } : {};
	Object.keys(DEFAULT_FEATURE_CONFIG).forEach(key => {
		const current = config && typeof config[key] === "object" ? config[key] : {};
		normalized[key] = { ...DEFAULT_FEATURE_CONFIG[key], ...current };
		if (normalized[key].value === "0" || normalized[key].value === "false") normalized[key].value = 0;
		if (normalized[key].value === "1" || normalized[key].value === "true") normalized[key].value = 1;
	});
	return normalized;
}

/** Return the main application's iframe window when it is available. */
function getMainFrameWindow() {
	const frame = document.querySelector("#iframeMain");
	if (!frame) return null;
	try {
		// contentWindow works even when the site omits the iframe name.  Keep
		// the named-frame fallback for older pages that expose it only there.
		const frameWindow = frame.contentWindow || (frame.name ? window.frames[frame.name] : null);
		if (!frameWindow) return null;
		// Accessing `document` is the only reliable same-origin check here.  A
		// cross-origin WindowProxy can be returned by contentWindow, but any
		// later DOM access would throw a SecurityError and stop the dispatcher.
		void frameWindow.document;
		return frameWindow;
	} catch (e) {
		return null;
	}
}

function getLessonId(url) {
	if (!url) return null;
	const explicitId = String(url).match(/[?&](?:lesson\.id|lessonId)=([0-9]+)/i);
	if (explicitId) return explicitId[1];
	const allIds = String(url).match(/[0-9]+/g);
	return allIds ? allIds[allIds.length - 1] : null;
}

function isCurrentSection(pattern) {
	const currentBar = document.getElementById("current-bar");
	if (!currentBar) return false;
	// Prefer the dedicated title/current item when present.  If the navigation
	// markup changed, test each direct child before falling back to the whole
	// bar (which may contain hidden menu labels).
	const preferred = currentBar.children[1]?.textContent ||
		currentBar.querySelector(".current,.active,[aria-current='page']")?.textContent;
	const candidates = [
		...(preferred ? [preferred] : []),
		...Array.from(currentBar.children).map((child) => child.textContent || ""),
	];
	if (!candidates.length) candidates.push(currentBar.textContent || "");
	return candidates.some((text) => {
		if (pattern.global) pattern.lastIndex = 0;
		const matched = pattern.test(text.replace(/\s+/g, ""));
		if (pattern.global) pattern.lastIndex = 0;
		return matched;
	});
}

function kissTJU() {
	console.log("func running: kissTJU");
	console.log(`host: ${$host}`);
	console.log(`path: ${$path}`);
	chrome.storage.sync.get(["kissTJUConfig"], function (data) {
		// The content script can run before the popup has ever been opened.
		// Treat a missing/invalid config as an empty config instead of aborting
		// the whole dispatcher with a destructuring error.
		const kissTJUConfig = normalizeFeatureConfig(data && data.kissTJUConfig);
		// console.log("config: ", kissTJUConfig);

		switch ($host) {
			case "classes.tju.edu.cn":
			case "saa.tju.edu.cn":
				handle_classes(kissTJUConfig);
				break;
			case "seatw.lib.tju.edu.cn":
				handle_seat(kissTJUConfig);
				break;
			case "www.icourse163.org":
			case "icourse163.org":
				handle_mooc(kissTJUConfig);
				break;
			case "sso.tju.edu.cn":
				handle_sso(kissTJUConfig);
				break;
			case "www.pigai.org":
			case "pigai.org":
				handle_pigai(kissTJUConfig);
				break;
			case "121.193.132.43":
				handle_thesis(kissTJUConfig);
				break;
			case "":
				break;
			default:
				break;
		}
	});
}

kissTJU();

/***********************界面****************************** */
/**
 * classes.tju.edu.cn
 * @returns
 */
function handle_classes(config) {
	console.log("func running: handle_classes");
	if ($host !== "classes.tju.edu.cn" && $host !== "saa.tju.edu.cn") {
		return;
	}
	const {
		autoEvaluate,
		myplan_fixMeterHead,
		removeFooter,
		checkClassInfo,
		showWeightedScore,
		classes_clickHeart,
		classes_expElect,
		classes_ifameToolbar,
		classes_timetablePreview,
	} = config || {};

	if (autoEvaluate && autoEvaluate.value) {
		fx_autoEvaluate();
	}
	if (myplan_fixMeterHead && myplan_fixMeterHead.value) {
		fx_myplan_fixMeterHead();
	}
	if (removeFooter && removeFooter.value) {
		fx_removeFooter();
	}
	if (checkClassInfo && checkClassInfo.value) {
		fx_checkClassInfo();
	}
	if (showWeightedScore && showWeightedScore.value) {
		fx_showWeightedScore();
	}
	if (classes_clickHeart && classes_clickHeart.value) {
		fx_classes_clickHeart();
	}
	if (classes_expElect && classes_expElect.value) {
		fx_classes_expElect();
	}
	if (classes_ifameToolbar && classes_ifameToolbar.value) {
		fx_classes_ifameToolbar();
	}
	if (classes_timetablePreview && classes_timetablePreview.value) {
		fx_classes_timetablePreview();
	}
}

function handle_seat(config) {
	console.log("func running: handle_seat");
	if ($host !== "seatw.lib.tju.edu.cn") {
		return;
	}
	const { seat_grab, seat_clickHeart } = config || {};
	if (seat_grab && seat_grab.value) {
		//fx_under_imagination()
	}
	if (seat_clickHeart && seat_clickHeart.value) {
		fx_common_clickHeart();
	}
}

function handle_mooc(config) {
	console.log("fx r: handle_mooc");
	if ($host !== "www.icourse163.org" && $host !== "icourse163.org") {
		return;
	}
	const { mook_jumpQuestion } = config || {};
	if (mook_jumpQuestion && mook_jumpQuestion.value) {
		fx_mook_jumpQuestion();
	}
}

function handle_sso_old_abandon(config) {
	console.log("fx r: handle_sso");
	if ($host !== "sso.tju.edu.cn") {
		return;
	}
	//如果有成功界面就停止
	if (document.querySelector(".alert-success")) {
		return;
	}
	//获取配置里的账号密码并填入
	chrome.storage.sync.get(["kissTJUConfig"], function (data) {
		const { kissTJUConfig } = data;
		if (kissTJUConfig && kissTJUConfig.sso_username && kissTJUConfig.sso_pswd) {
			const usernameInput = document.getElementById("username");
			const passwordInput = document.getElementById("password");
			if (usernameInput) usernameInput.value = atob(kissTJUConfig.sso_username);
			if (passwordInput) passwordInput.value = atob(kissTJUConfig.sso_pswd);
		}
	});
	//在输入框下面添加保存密码和遗忘密码的按钮
	const temp1 = document.querySelector(".sidebar-content");
	if (!temp1 || !temp1.children[0]) return;
	const storageInfo = temp1.children[0].cloneNode(true);

	storageInfo.children[0].href = "";
	storageInfo.children[0].textContent = "让kissTJU存储您的账号和密码";

	const forgetInfo = temp1.children[0].cloneNode(true);
	forgetInfo.children[0].href = "";
	forgetInfo.children[0].textContent = "让kissTJU忘记您的账号和密码";

	storageInfo.onclick = function () {
		chrome.storage.sync.get(["kissTJUConfig"], function (data) {
			const { kissTJUConfig } = data;
			if (kissTJUConfig) {
				kissTJUConfig.sso_username = btoa(document.getElementById("username")?.value);
				kissTJUConfig.sso_pswd = btoa(document.getElementById("password")?.value);
				chrome.storage.sync.set({ kissTJUConfig }, function () {});
				alert("(kissTJU不会发送您的账号和密码，但是会将其转换编码后以密文存储在本地，其他浏览器插件或网页可以读取，有泄密风险)");
			}
		});
	};

	forgetInfo.onclick = function () {
		chrome.storage.sync.get(["kissTJUConfig"], function (data) {
			const { kissTJUConfig } = data;
			if (kissTJUConfig) {
				kissTJUConfig.sso_username = void 0;
				kissTJUConfig.sso_pswd = void 0;
				chrome.storage.sync.set({ kissTJUConfig }, function () {});
				alert("(已从本地删除您的账号和密码记录)");
			}
		});
	};

	temp1.appendChild(storageInfo);
	temp1.appendChild(forgetInfo);

	const { sso_fixForm } = config || {};
	if (sso_fixForm && sso_fixForm.value) {
		fx_sso_fixForm();
	}
}

function handle_sso(config) {
	console.log("fx r: handle_sso");
	if ($host !== "sso.tju.edu.cn") {
		return;
	}
	const { sso_genshinStart, sso_setRobot, sso_fixForm, sso_antiWeakPwd } = config || {};
	if (sso_genshinStart && sso_genshinStart.value) {
		fx_sso_genshinStart();
	}
	if (sso_setRobot && sso_setRobot.value) {
		fx_sso_setRobot(sso_setRobot.value);
	}
	if (sso_fixForm && sso_fixForm.value) {
		fx_sso_fixForm();
	}
	if (sso_antiWeakPwd && sso_antiWeakPwd.value) {
		fx_sso_antiWeakPwd();
	}
}

function handle_pigai(config) {
	console.log("fx r: handle_pigai");
	if ($host !== "www.pigai.org" && $host !== "pigai.org") {
		return;
	}
	const { pigai_paste } = config || {};
	if (pigai_paste && pigai_paste.value) {
		fx_pigai_paste();
	}
}

function handle_thesis(config) {
	console.log("fx r: handle_thesis");
	if ($host !== "121.193.132.43") {
		return;
	}
	const { thesis_iReallyKnow, thesis_autoLogin } = config || {};
	if (thesis_iReallyKnow && thesis_iReallyKnow.value) {
		fx_thesis_iReallyKnow();
	}
	if (thesis_autoLogin && thesis_autoLogin.value) {
		fx_thesis_autoLogin();
	}
}

/********************工具函数**************************/
/**
 * 自动评教
 */
function fx_autoEvaluate() {
	console.log("fx r: autoEvaluate");
	let timer = setInterval(function () {
		if (
			//有两个入口进入评教界面 其中从成绩界面打开的评教会新建标签页
			window.location.pathname.indexOf("/eams/quality/stdEvaluate!answer.action") !== -1
		) {
			inject(window);
		} else {
			const iframeWindow = getMainFrameWindow();
			if (iframeWindow) inject(iframeWindow);
		}
	}, 500);

	function inject(mWindow) {
		if (!mWindow || mWindow.is_inj_autoEvaluate) return;

		let head = mWindow.document?.querySelector("#head");
		if (!head) return;
		// Other EAMS pages also expose #head; require evaluation controls before
		// adding a button, otherwise navigation-only pages get a dead control.
		const hasEvaluationForm = mWindow.document?.querySelector(
			".option-item, .answer.answer-textarea"
		);
		if (!hasEvaluationForm) return;
		let autoEvalBtn = document.createElement("button");
		autoEvalBtn.textContent = "自动评教";

		autoEvalBtn.onclick = () => {
			//选择题
			const options = mWindow.document?.getElementsByClassName("option-item");
			for (let i = 0; i < options.length; i++) {
				let element = options[i];
				let text = element.children[1]?.textContent?.trim();
				if (text === "非常满意" || text === "非常同意") {
					element.children[0]?.click();
				}
			}
			//填空题
			let completions = mWindow.document?.getElementsByClassName("answer answer-textarea");
			const EventCtor = mWindow.document?.defaultView?.Event || (typeof Event === "function" ? Event : null);
			for (let i = 0; i < completions.length; i++) {
				let element = completions[i];
				if ("value" in element) {
					element.value = "承蒙赐教，感激涕零";
				} else {
					element.textContent = "承蒙赐教，感激涕零";
				}
				if (EventCtor) {
					try { element.dispatchEvent?.(new EventCtor("input", { bubbles: true })); } catch (e) {}
				}
			}
			//提交
			let subBtn = mWindow.document?.getElementById("sub");
			subBtn && subBtn.click();
		};
		head.append(autoEvalBtn);

		mWindow.is_inj_autoEvaluate = true;
	}
}

/**
 * 培养计划表头固定
 */
function fx_myplan_fixMeterHead() {
	console.log("fx r :myplan_fixMeterHead");
	//检测到对应界面打开才会注入
	let timer = setInterval(function () {
		inject();
	}, 500);

	function inject() {
		const frames = document.querySelector("#iframeMain");
		const ifameWindow = getMainFrameWindow();
		if (!frames || !ifameWindow) return;
		const framesTop = frames.getBoundingClientRect().top; //iframe相对window的高度offset
		// const thead = ifameWindow.document.querySelector("#planInfoTable223191 thead");
		const thead = ifameWindow.document.querySelector(".planTable thead");
		if (!thead) return;
		if (ifameWindow.is_inj_fx_myplan_fixMeterHead) return;

		const theadTop = thead.getBoundingClientRect().top; //thead表头相对于iframe内window的高度offset
		const offset = Math.max(0, framesTop + theadTop); //总高度offset
		// console.log("offset: ", offset);
		thead.style.position = "relative";
		//用户下拉列表到一定高度后，表头固定在网页顶部
		document.addEventListener("scroll", (e) => {
			const scrollY = window.scrollY;
			// console.log("ccrollY: ", scrollY);
			if (scrollY < offset) {
				thead.style.top = "0";
			} else {
				thead.style.top = scrollY - offset + "px";
			}
		});
		ifameWindow.is_inj_fx_myplan_fixMeterHead = true;
	}
}

/**
 * 移除底部栏
 */
function fx_removeFooter() {
	console.log("fx r: removeFooter");
	const removeFooter = () => {
		const elementFooter = document.getElementById("footer");
		if (!elementFooter) return false;
		elementFooter.remove();
		return true;
	};
	if (removeFooter()) return;
	let timer;
	let attempts = 0;
	timer = setInterval(() => {
		if (removeFooter()) {
			clearInterval(timer);
		} else if (++attempts >= 120) {
			clearInterval(timer);
		}
	}, 250);
}

/**
 * 课表功能增强：便捷查看课程信息课程大纲
 */
function fx_checkClassInfo() {
	console.log("fx r: checkClassInfo");
	let timer = setInterval(function () {
		inject();
	}, 500);

	function inject() {
		const ifameWindow = getMainFrameWindow();
		if (!ifameWindow) return;

		const tbody = ifameWindow.document.querySelector("#tasklesson .grid .gridtable tbody");
		if (!tbody) {
			return;
		}
		let processed = 0;
		for (let i = 0; i < tbody.children.length; i++) {
			const tr = tbody.children[i];
			if (!tr || tr.children.length < 4) continue;
			const sourceLink = tr.querySelector("a[href*='lesson.id'], a[href*='lessonId'], a[href*='courseTableForStd'], a[href*='stdSyllabus']") || tr.querySelector("td a");
			if (!sourceLink || tr.children.length < 4) continue;
			const uselessUrl = sourceLink.href; //e.g. http://classes.tju.edu.cn/eams/courseTableForStd!taskTable.action?lesson.id=114514
			const lessonId = getLessonId(uselessUrl); //系统隐藏id，不是课程序号也不是课程代码
			if (!lessonId) continue;
			const existingInfo = tr.children[2].querySelector("a[data-kisstju-course-info='1'], a[href*='stdSyllabus!info.action']");
			const existingProgram = tr.children[3].querySelector("a[data-kisstju-course-program='1'], a[href*='syllabusInfo.action']");
			if (existingInfo && existingProgram && getLessonId(existingInfo.href) === lessonId && getLessonId(existingProgram.href) === lessonId) {
				tr.dataset.kisstjuCourseInfo = "1";
				continue;
			}
			const lessonCode = tr.children[2].textContent.trim(); //课程代码
			const lessonName = tr.children[3].textContent.trim(); //课程名称
			//课程详情
			const lessonInfoBtn = document.createElement("a");
			lessonInfoBtn.target = "_blank"; //必须新窗口打开不然出bug
			lessonInfoBtn.href = `/eams/stdSyllabus!info.action?lesson.id=${lessonId}`; //查看课程详情
			lessonInfoBtn.textContent = lessonCode;
			lessonInfoBtn.dataset.kisstjuCourseInfo = "1";
			tr.children[2].innerHTML = ""; //删除原有的文字
			tr.children[2].appendChild(lessonInfoBtn); //添加的标签
			//课程大纲
			const lessonProgBtn = document.createElement("a");
			lessonProgBtn.target = "_blank"; //必须新窗口打开不然出bug
			lessonProgBtn.href = `/eams/stdSyllabus!syllabusInfo.action?lesson.id=${lessonId}`;
			lessonProgBtn.textContent = lessonName;
			lessonProgBtn.dataset.kisstjuCourseProgram = "1";
			tr.dataset.kisstjuCourseInfo = "1";
			processed++;
			tr.children[3].innerHTML = ""; //删除原有的文字
			tr.children[3].appendChild(lessonProgBtn); //添加的标签
			//课程评教 id原理未知
			// const lessonEvalBtn = document.createElement("a");
			// lessonEvalBtn.target = "_blank"; //必须新窗口打开不然出bug
			// lessonEvalBtn.href = `http://classes.tju.edu.cn/eams/quality/stdEvaluate!answer.action?evaluationLesson.id=${lessonId}`;
			// lessonEvalBtn.innerHTML = teacherName;
			// tr.children[5].innerHTML = ""; //删除原有的文字
			// tr.children[5].appendChild(lessonEvalBtn); //添加的标签
		}
		// Rows may be rendered asynchronously.  Only mark the table after at
		// least one row was actually transformed.
		if (processed > 0) tbody.dataset.kisstjuInjected = "1";
	}
}

/**
 * 成绩界面计算加权分数绩点
 */
function fx_showWeightedScore() {
	console.log("fx r: showWeightedScore");
	let timer = setInterval(function () {
		inject();
	}, 500);
	function inject() {
		const ifameWindow = getMainFrameWindow();
		if (!ifameWindow) return;

		//按下切换学期按钮顺带将is_inj_fx_showWeightedScore标记设置为false 解决切换学期计算加权失效
		const resetWeightedScore = () => {
			ifameWindow.is_inj_fx_showWeightedScore = false;
			const currentBody = ifameWindow.document.querySelector("#semesterGrade .gridtable tbody");
			if (currentBody) {
				currentBody.dataset.kisstjuWeightedInjected = "0";
				delete currentBody.dataset.kisstjuWeightedSignature;
			}
		};
		ifameWindow.document.querySelectorAll("#semesterForm input, #semesterForm button, #semesterForm select").forEach((item) => {
			const tagName = item.tagName.toLowerCase();
			const isSubmit = item.type === "submit" || tagName === "button";
			if ((isSubmit || tagName === "select") && item.dataset.kisstjuWeightedListener !== "1") {
				item.addEventListener(isSubmit ? "click" : "change", resetWeightedScore);
				item.dataset.kisstjuWeightedListener = "1";
			}
		});
		const semesterForm = ifameWindow.document.querySelector("#semesterForm");
		if (semesterForm && semesterForm.dataset.kisstjuWeightedSubmit !== "1") {
			// Newer EAMS versions submit the semester through an anchor/AJAX
			// handler rather than a submit button. Capture both events so the
			// previous summary row is invalidated before the request runs.
			semesterForm.addEventListener("submit", resetWeightedScore, true);
			semesterForm.addEventListener("click", (event) => {
				const control = event.target?.closest?.("input,button,select,a");
				if (!control) return;
				const tagName = control.tagName.toLowerCase();
				if (tagName === "select" || tagName === "a" || control.type === "submit" || tagName === "button") {
					resetWeightedScore();
				}
			}, true);
			semesterForm.dataset.kisstjuWeightedSubmit = "1";
		}

		const thead = ifameWindow.document.querySelector("#semesterGrade .gridtable thead tr"); //只有一个子元素直接定位到tr更方便
		const tbody = ifameWindow.document.querySelector("#semesterGrade .gridtable tbody");
		if (!(thead && tbody)) {
			return;
		}
		const isGeneratedRow = (row) => row.dataset.kisstjuWeighted === "1" || row.children[2]?.textContent.trim() === "kissTJU";
		const generatedRows = Array.from(tbody.children).filter(isGeneratedRow);
		const tableSignature = Array.from(tbody.children)
			.filter((row) => !isGeneratedRow(row))
			.map((row) => row.textContent.replace(/\s+/g, " ").trim())
			.join("\u001f");
		// Recalculate when the site updates the existing tbody in place after a
		// semester request, and recover when it removes our summary row.
		if (tbody.dataset.kisstjuWeightedSignature === tableSignature && generatedRows.length) return;
		generatedRows.forEach((row) => row.remove());
		let colScore = 6;
		let colGPA = 7;
		let colCredit = 5;
		for (let i = 0; i < thead.children.length; i++) {
			const headerText = thead.children[i].textContent.replace(/\s+/g, "");
			if (headerText.includes("总评成绩")) {
				colScore = i;
			}
			if (headerText.includes("绩点")) {
				colGPA = i;
			}
			if (headerText.includes("学分") || headerText.includes("课程学分")) {
				colCredit = i;
			}
		}

		const len = tbody.children.length;
		let calculated = false;
		if (len) {
			let totalCredit = 0;
			let totalScore = 0;
			let totalGPA = 0;
			for (let i = 0; i < len; i++) {
				let tr = tbody.children[i];
				if (!tr.children || tr.children.length <= Math.max(colScore, colGPA, colCredit)) continue;
				//如果已经计算过了，就不再加新行了
				if (isGeneratedRow(tr)) continue;
				//重修成绩不计入
				const rowText = tr.textContent.replace(/\s+/g, "").trim();
				const courseType = tr.children[2]?.textContent.replace(/\s+/g, "").trim() || "";
				if (/(重修)/.test(courseType) || /(合计|总计|平均|累计)/.test(rowText)) {
					continue;
				}
				//未评教的情况会没有5、6、7列 考虑只计算显示了成绩的科目
				const toNumber = (cell) => {
					const value = cell?.textContent?.replace(/,/g, "").trim();
					if (!value || !/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return NaN;
					return Number(value);
				};
				const credit = toNumber(tr.children[colCredit]);
				const score = toNumber(tr.children[colScore]);
				const GPA = toNumber(tr.children[colGPA]);
				if (![credit, score, GPA].every(Number.isFinite) || credit <= 0) {
					continue; //成绩可能是P
				}
				totalCredit += credit;
				totalScore += credit * score;
				totalGPA += credit * GPA;
			}
			if (!totalCredit) return;
			const avgScore = totalScore / totalCredit;
			const avgGPA = totalGPA / totalCredit;
			//实现一定程度上的色彩风格统一 并清除克隆内容
			const templateRow = Array.from(tbody.children).find((row) =>
				!isGeneratedRow(row) && row.children.length > Math.max(colScore, colGPA, colCredit, 4)
			);
			if (!templateRow) return;
			const newTr = templateRow.cloneNode(true);
			for (let i = 1; i < newTr.children.length; i++) {
				newTr.children[i].textContent = "";
			}
			if (newTr.children[1]) newTr.children[1].textContent = "1919810";
			if (newTr.children[2]) newTr.children[2].textContent = "kissTJU";
			if (newTr.children[3]) newTr.children[3].textContent = "实用工具";
			if (newTr.children[4]) newTr.children[4].textContent = "不修";
			newTr.children[colCredit].textContent = `共${totalCredit}`;
			newTr.children[colScore].textContent = avgScore.toFixed(3);
			newTr.children[colGPA].textContent = avgGPA.toFixed(3);
			newTr.dataset.kisstjuWeighted = "1";
			tbody.append(newTr);
			calculated = true;
		}

		// Keep retrying while the semester table is empty or still loading.
		if (calculated) {
			tbody.dataset.kisstjuWeightedInjected = "1";
			tbody.dataset.kisstjuWeightedSignature = tableSignature;
			ifameWindow.is_inj_fx_showWeightedScore = true;
		}
	}
}

/**
 * 鼠标点击显示小心心 class用iframe比较特殊所以单独写
 */
function fx_classes_clickHeart() {
	if (isLite) return;
	console.log("fx r: clickHeart");
	let timer = setInterval(function () {
		if (isCurrentSection(/./)) {
			inject();
			// clearInterval(timer);
		}
	}, 1000);

	function inject() {
		const ifameWindow = getMainFrameWindow();
		if (!ifameWindow || ifameWindow.is_inj_fx_classes_clickHeart) return;
		ifameWindow.is_inj_fx_classes_clickHeart = true;
		const frames = document.querySelector("#iframeMain");
		if (!frames) {
			ifameWindow.is_inj_fx_classes_clickHeart = false;
			return;
		}
		const framesTop = frames.getBoundingClientRect().top; //iframe相对window的高度offset

		showHeart(ifameWindow, document);

		function showHeart(myWindow, document) {
			let hearts = [];

			myWindow.requestAnimationFrame = (function () {
				return (
					myWindow.requestAnimationFrame ||
					myWindow.webkitRequestAnimationFrame ||
					myWindow.mozRequestAnimationFrame ||
					myWindow.oRequestAnimationFrame ||
					myWindow.msRequestAnimationFrame ||
					function (callback) {
						setTimeout(callback, 1000 / 60);
					}
				);
			})();

			init();

			function init() {
				css(
					".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: absolute;}.heart:after{top: -5px;}.heart:before{left: -5px;}"
				);
				attachEvent();
				gameloop();
			}

			function gameloop() {
				for (let i = 0; i < hearts.length; i++) {
					if (hearts[i].alpha <= 0) {
						hearts[i].el.remove();
						hearts.splice(i, 1);
						continue;
					}

					hearts[i].y--;
					hearts[i].x += (Math.random() - 0.5) * 8;
					hearts[i].scale += 0.004;
					hearts[i].alpha -= 0.013;
					hearts[i].el.style.cssText =
						"left:" +
						hearts[i].x +
						"px;top:" +
						hearts[i].y +
						"px;opacity:" +
						hearts[i].alpha +
						";transform:scale(" +
						hearts[i].scale +
						"," +
						hearts[i].scale +
						") rotate(45deg);background:" +
						hearts[i].color;
				}

				myWindow.requestAnimationFrame(gameloop);
			}

			function attachEvent() {
				let old = typeof myWindow.onclick === "function" && myWindow.onclick;
				myWindow.onclick = function (event) {
					old && old(event);
					if (event) {
						let i = 0;
						let timer = setInterval(function () {
							createHeart(event);
							i++;
							if (i > 5) {
								clearInterval(timer);
							}
						}, 100);
					}
				};
			}

			function createHeart(event) {
				if (!event || !document.body) return;
				let d = document.createElement("div");
				d.className = "heart";
				hearts.push({
					el: d,
					x: event.clientX - 5,
					y: event.clientY - 5 + framesTop,
					scale: 1,
					alpha: 1,
					color: randomColor(),
				});

				document.body.appendChild(d);
			}

			function css(css) {
				let style = document.createElement("style");
				style.type = "text/css";
				try {
					style.appendChild(document.createTextNode(css));
				} catch (ex) {
					style.styleSheet.cssText = css;
				}

				const head = document.getElementsByTagName("head")[0];
				if (head) head.appendChild(style);
			}

			function randomColor() {
				return "rgb(" + ~~(Math.random() * 255) + "," + ~~(Math.random() * 255) + "," + ~~(Math.random() * 255) + ")";
			}
		}
	}
}

/**
 * 实验课选课功能增强 一键过滤 一键排序等
 */
function fx_classes_expElect() {
	console.log("fx r: fx_classes_expElect");
	let timer = setInterval(function () {
		inject();
	}, 500);
	function inject() {
		const ifameWindow = getMainFrameWindow();
		if (!ifameWindow) return;

		// In the current EAMS markup the id is on the <tbody> itself.  The old
		// descendant selector (`tbody #lessonItemList_data`) therefore matched
		// nothing and disabled the entire experiment-course enhancement.
		const lessonData = ifameWindow.document.querySelector("#lessonItemList_data") || ifameWindow.document.querySelector("tbody #lessonItemList_data");
		const tbody = lessonData && (lessonData.tagName?.toLowerCase() === "tbody" || !lessonData.querySelector
			? lessonData
			: lessonData.querySelector("tbody"));
		const tbar = ifameWindow.document.querySelector("#lessonItemList_bar1");

		if (!(tbody && tbar)) {
			return;
		}
		const len = tbody.children.length;
		if (!len) return;
		let enrolledColumn = 11;
		let capacityColumn = 12;
		const headerRow = tbody.closest("table")?.querySelector("thead tr");
		if (headerRow) {
			for (let i = 0; i < headerRow.children.length; i++) {
				const headerText = headerRow.children[i].textContent.replace(/\s+/g, "");
				if (/(选课人数|已选人数|当前人数)/.test(headerText)) enrolledColumn = i;
				if (/(计划人数|人数上限|容量)/.test(headerText)) capacityColumn = i;
			}
		}

		//页面切换筛选条件时通常会复用工具栏、只替换 tbody。按 tbody
		//记录注入状态，避免新表格没有增强功能，也避免按钮重复添加。
		if (tbar.__kissTJUInjectedBody === tbody) {
			const activeFilter = tbar.querySelector?.("button[data-kisstju-exp-role='filter']");
			if (activeFilter?.dataset.kisstjuFilterEnabled === "1") activeFilter.__kissTJURefresh?.();
			return;
		}
		tbar.querySelectorAll("[data-kisstju-exp-control='1']").forEach((control) => control.remove());

		//过滤器 只看未满
		const btn_select = document.createElement("button");
		btn_select.textContent = "只看未满";
		btn_select.dataset.kisstjuExpControl = "1";
		btn_select.dataset.kisstjuExpRole = "select";
		btn_select.onclick = () => {
			for (const tr of Array.from(tbody.children)) {
				if (!tr || tr.children.length <= Math.max(enrolledColumn, capacityColumn)) continue;
				const a = Number(tr.children[enrolledColumn].textContent.replace(/,/g, "").trim()); //选课人数
				const b = Number(tr.children[capacityColumn].textContent.replace(/,/g, "").trim()); //计划人数
				if (Number.isFinite(a) && Number.isFinite(b) && a >= b) {
					tr.style.display = "none";
				}
			}
		};
		tbar.append(btn_select);

		//要素过滤
		const btn_filter = document.createElement("button");
		btn_filter.textContent = "要素过滤";
		btn_filter.dataset.kisstjuExpControl = "1";
		btn_filter.dataset.kisstjuExpRole = "filter";
		const bindFilterCells = () => {
			for (const tr of Array.from(tbody.children)) {
				if (!tr || tr.children.length < 2) continue;
				const len1 = tr.children.length;
				//tr的第一个是一个勾选框 最后一个是选课按钮 不动
				for (let j = 1; j < len1 - 1; j++) {
					const td = tr.children[j];
					const text = td.textContent;
					if (td.dataset.kisstjuFilterBoundText === text) continue;
					td.dataset.kisstjuFilterBoundText = text;
					td.onclick = () => {
						const checkbox = tr.children[0]?.querySelector("input[type=checkbox]");
						if (checkbox) checkbox.checked = false; //设置勾选框避免选中消失的tr
						const filterKey = document.createElement("button"); //顶部展示过滤的关键词
						filterKey.dataset.kisstjuExpControl = "1";
						filterKey.textContent = text;
						filterKey.onclick = () => {
							for (const trk of Array.from(tbody.children)) {
								const tdkj = trk.children[j];
								if (tdkj && tdkj.textContent === text) trk.style.display = "";
							}
							filterKey.style.display = "none";
						};
						tbar.append(filterKey);
						for (const trk of Array.from(tbody.children)) {
							const tdkj = trk.children[j];
							if (tdkj && tdkj.textContent === text) trk.style.display = "none";
						}
					};
				}
			}
		};
		btn_filter.onclick = () => {
			btn_filter.textContent = "要素过滤已开启";
			btn_filter.dataset.kisstjuFilterEnabled = "1";
			bindFilterCells();
		};
		btn_filter.__kissTJURefresh = bindFilterCells;
		tbar.append(btn_filter);
		tbar.__kissTJUInjectedBody = tbody;
		tbar.dataset.kisstjuInjected = "1";
	}
}

/**
 * 添加按钮实现只对ifame套娃网页的操作 如刷新、前进、后退等
 * 但是由于原网站开发逻辑混乱 此插件跳起来也不丝滑 除非每次切换都储存一下(暂未实现) 而且难以实现返回不重载
 */
function fx_classes_ifameToolbar() {
	console.log("fx r: fx_classes_ifameToolbar");
	let timer = setInterval(function () {
		if (~window.location.pathname.indexOf("/eams/homeExt.action")) {
			//pathname可能是/eams/homeExt.action;jsessionid=1919810ZWXWCNM1114514.std4#不能===
			inject();
		}
	}, 500);
	function inject() {
		const currentBar = document.querySelector("#current-bar");
		const ifameWindow = getMainFrameWindow();
		if (!currentBar || !ifameWindow || currentBar.dataset.kisstjuInjected === "1") return;

		const ifameReloadBtn = document.createElement("button");
		ifameReloadBtn.type = "button";
		ifameReloadBtn.dataset.kisstjuIframeToolbar = "1";
		ifameReloadBtn.style.marginLeft = "100px";
		ifameReloadBtn.textContent = "↻刷新子网页";
		ifameReloadBtn.onclick = () => {
			try {
				getMainFrameWindow()?.location.reload();
			} catch (e) {}
		};
		currentBar.append(ifameReloadBtn);

		const ifameBackBtn = document.createElement("button");
		ifameBackBtn.type = "button";
		ifameBackBtn.dataset.kisstjuIframeToolbar = "1";
		ifameBackBtn.textContent = "←子网页后退";
		ifameBackBtn.onclick = () => {
			try {
				getMainFrameWindow()?.history.back();
			} catch (e) {}
		};
		currentBar.append(ifameBackBtn);

		const ifameForwardBtn = document.createElement("button");
		ifameForwardBtn.type = "button";
		ifameForwardBtn.dataset.kisstjuIframeToolbar = "1";
		ifameForwardBtn.textContent = "→子网页前进";
		ifameForwardBtn.onclick = () => {
			try {
				getMainFrameWindow()?.history.forward();
			} catch (e) {}
		};
		currentBar.append(ifameForwardBtn);
		currentBar.dataset.kisstjuInjected = "1";
	}
}

/**
 * 从全校开课查询跳到课程排表
 * 可查看预排课表，但未必是最终课表
 */
function fx_classes_timetablePreview() {
	console.log("fx r: fx_classes_timetablePreview");
	let timer = setInterval(function () {
		inject();
	}, 500);

	function inject() {
		const ifameWindow = getMainFrameWindow();
		if (!ifameWindow) return;

		const tbody = ifameWindow.document.querySelector("#taskListForm .gridtable tbody") ||
			ifameWindow.document.querySelector("#taskListForm table.gridtable tbody");
		if (!tbody) {
			return;
		}
		let processed = 0;
		for (let i = 0; i < tbody.children.length; i++) {
			const tr = tbody.children[i];
			if (!tr || tr.children.length < 2) continue;
			const lessonNum = tr.children[1].textContent.trim(); //课程序号
			const sourceLink = tr.querySelector("a[href*='lesson.id'], a[href*='lessonId'], a[href*='stdSyllabus'], a[href*='courseTableForStd']") || tr.querySelector("td a");
			if (!sourceLink) continue;
			const uselessUrl = sourceLink.href; //e.g. "/eams/stdSyllabus!info.action?lesson.id=433941"
			const lessonId = getLessonId(uselessUrl); //这个id是系统隐藏id，不是课程序号也不是课程代码
			if (!lessonId) continue;
			const existingLink = tr.children[1].querySelector("a[data-kisstju-timetable='1']");
			if (existingLink && getLessonId(existingLink.href) === lessonId) {
				tr.dataset.kisstjuTimetable = "1";
				continue;
			}
			//查看课程排班
			const lessonTimetableBtn = document.createElement("a");
			lessonTimetableBtn.target = "_blank"; //必须新窗口打开不然出bug
			lessonTimetableBtn.href = `/eams/courseTableForStd!taskTable.action?lesson.id=${lessonId}`; //查看课程详情
			lessonTimetableBtn.textContent = lessonNum;
			lessonTimetableBtn.dataset.kisstjuTimetable = "1";
			tr.dataset.kisstjuTimetable = "1";
			processed++;
			tr.children[1].innerHTML = ""; //删除原有的文字
			tr.children[1].appendChild(lessonTimetableBtn); //添加的标签
		}
		if (processed > 0) tbody.dataset.kisstjuInjected = "1";
	}
}

/**
 * MOOC看视频跳题
 */
function fx_mook_jumpQuestion() {
	console.log("fx r: fx_mook_jumpQuestion");
	inject();
	function inject() {
		(function () {
			setInterval(function () {
				let question = document.querySelector(".u-btn.u-btn-default.cont.j-continue");
				if (question) {
					question.parentNode?.remove();
				}
				let video = document.querySelector("video");
				if (video && video.paused) {
					const playPromise = video.play();
					if (playPromise && typeof playPromise.catch === "function") {
						playPromise.catch(() => {});
					}
				}
			}, 5000);
		})();
	}
}

/**
 * 通用点击小心心
 */
function fx_common_clickHeart() {
	if (isLite) return;
	(function (window, document, undefined) {
		var hearts = [];

		window.requestAnimationFrame = (function () {
			return (
				window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function (callback) {
					setTimeout(callback, 1000 / 60);
				}
			);
		})();

		init();

		function init() {
			css(
				".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: absolute;}.heart:after{top: -5px;}.heart:before{left: -5px;}"
			);
			attachEvent();
			gameloop();
		}

		function gameloop() {
			for (var i = 0; i < hearts.length; i++) {
				if (hearts[i].alpha <= 0) {
					hearts[i].el.remove();
					hearts.splice(i, 1);
					continue;
				}

				hearts[i].y--;
				hearts[i].scale += 0.004;
				hearts[i].alpha -= 0.013;
				hearts[i].el.style.cssText =
					"left:" +
					hearts[i].x +
					"px;top:" +
					hearts[i].y +
					"px;opacity:" +
					hearts[i].alpha +
					";transform:scale(" +
					hearts[i].scale +
					"," +
					hearts[i].scale +
					") rotate(45deg);background:" +
					hearts[i].color;
			}

			window.requestAnimationFrame(gameloop);
		}

		function attachEvent() {
			var old = typeof window.onclick === "function" && window.onclick;
			window.onclick = function (event) {
				old && old(event);
				createHeart(event);
			};
		}

		function createHeart(event) {
			if (!event || !document.body) return;
			var d = document.createElement("div");
			d.className = "heart";
			hearts.push({
				el: d,
				x: event.clientX - 5,
				y: event.clientY - 5,
				scale: 1,
				alpha: 1,
				color: randomColor(),
			});

			document.body.appendChild(d);
		}

		function css(css) {
			var style = document.createElement("style");
			style.type = "text/css";
			try {
				style.appendChild(document.createTextNode(css));
			} catch (ex) {
				style.styleSheet.cssText = css;
			}

			const head = document.getElementsByTagName("head")[0];
			if (head) head.appendChild(style);
		}

		function randomColor() {
			return "rgb(" + ~~(Math.random() * 255) + "," + ~~(Math.random() * 255) + "," + ~~(Math.random() * 255) + ")";
		}
	})(window, document);
}

/**
 * 登录界面自动填验证码
 * 新版
 */
function fx_sso_fixForm() {
	console.log("fx r: fx_sso_fixForm");
	//如果是弱密码而且没开跳过弱密码选项 验证成功之后会重新跳转并额外弹窗弱密码 导致死循环
	let attempts = 0;
	let timer;
	let injected = false;
	let imageObserver;
	const tryInject = () => {
		const codeImage = document.querySelector("#codeImage, img[src*='/cas/code']");
		const codeInput = document.querySelector("#code, input[name='code']");
		if (codeInput && codeInput.dataset?.kisstjuAutoInputBound !== "1") {
			const clearAutoMarker = () => {
				if (codeInput.dataset) delete codeInput.dataset.kisstjuAutoCode;
			};
			codeInput.addEventListener?.("input", clearAutoMarker);
			codeInput.addEventListener?.("change", clearAutoMarker);
			if (codeInput.dataset) codeInput.dataset.kisstjuAutoInputBound = "1";
		}
		const canReplaceCode = codeInput &&
			(codeInput.value === "" || codeInput.dataset?.kisstjuAutoCode === "1");
		if (codeImage && canReplaceCode) {
			injected = true;
			if (timer) clearInterval(timer);
			inject(codeImage);
		} else if (++attempts >= 120) {
			// Login markup can be inserted asynchronously, but do not leave a
			// permanent poller running on non-login/error pages.
			if (timer) clearInterval(timer);
		}
	};
	tryInject();
	if (!injected) timer = setInterval(tryInject, 500);

	function inject(codeImage) {
		if (!codeImage || codeImage.dataset.kisstjuCaptchaBound === "1") return;
		codeImage.dataset.kisstjuCaptchaBound = "1";
		const canvas = document.createElement("canvas");
		canvas.style.display = "none";
		(document.body || document.documentElement).append(canvas);
		const img = codeImage;
		if (!img) return;

		img.setAttribute("referrerpolicy", "no-referrer");
	let recognizedSource = "";
		let processingSource = "";
		let recognitionToken = 0;
		const recognize = () => {
			const currentCodeInput = document.querySelector("#code, input[name='code']");
			if (!currentCodeInput ||
				(currentCodeInput.value !== "" && currentCodeInput.dataset?.kisstjuAutoCode !== "1")) return;
			// The SSO page keeps the same image element and only changes its src
			// when the user requests a new captcha.  Track the source instead of
			// using a one-shot load listener so every new image can be recognized.
			const source = img.currentSrc || img.src || "";
			if (!source || source === recognizedSource || source === processingSource) return;
			processingSource = source;
			const token = ++recognitionToken;
			let [width, height] = [img.naturalWidth || 70, img.naturalHeight || 36];

			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext("2d");
			if (!ctx || typeof ctx.drawImage !== "function" || typeof ctx.getImageData !== "function") {
				processingSource = "";
				return;
			}
			let imageData;
			try {
				ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
				imageData = ctx.getImageData(0, 0, width, height).data;
			} catch (e) {
				// A rejected CORS image taints the canvas.  Leave the login form
				// usable instead of throwing from the content script.
				processingSource = "";
				return;
			}

			//擦边界
			//这个点黑不黑
			function isBlack(i, j) {
				if (i < 0 || j < 0) {
					return null;
				}
				const r = imageData[4 * (i * width + j) + 0];
				const g = imageData[4 * (i * width + j) + 1];
				const b = imageData[4 * (i * width + j) + 2];
				//阈值
				if (r + g + b < 80) {
					return true;
				} else {
					return false;
				}
			}
			// 二值化
			for (let i = 0; i < height; i += 1) {
				for (let j = 0; j < width; j += 1) {
					if (!isBlack(i, j)) {
						imageData[4 * (i * width + j) + 0] = 255;
						imageData[4 * (i * width + j) + 1] = 255;
						imageData[4 * (i * width + j) + 2] = 255;
						imageData[4 * (i * width + j) + 3] = 255;
					} else {
						imageData[4 * (i * width + j) + 0] = 0;
						imageData[4 * (i * width + j) + 1] = 0;
						imageData[4 * (i * width + j) + 2] = 0;
						imageData[4 * (i * width + j) + 3] = 255;
					}
				}
			}

			if (typeof ImageData !== "function" || typeof canvas.toDataURL !== "function" || typeof ctx.putImageData !== "function") {
				processingSource = "";
				return;
			}
			const myimg = new ImageData(imageData, width, height);
			ctx.putImageData(myimg, 0, 0, 0, 0, width, height);

			if (typeof Tesseract === "undefined" || !Tesseract || typeof Tesseract.recognize !== "function") {
				processingSource = "";
				return;
			}
			let recognition;
			try {
				const dataURL = canvas.toDataURL("image/jpeg");
				recognition = Tesseract.recognize(dataURL, "eng", { logger: () => {} });
			} catch (e) {
				processingSource = "";
				return;
			}
			Promise.resolve(recognition).then(({ data: { text } }) => {
				if (token !== recognitionToken || (img.currentSrc || img.src || "") !== source) {
					if (processingSource === source) processingSource = "";
					return;
				}
				processingSource = "";
				let code = typeof text === "string" ? text.replace(/[^a-zA-Z0-9]/g, "").trim() : "";

				console.log(text, code);
				// alert(`${text}--${code}`);
				if (!code) {
					// A successful worker response can still contain no usable glyphs;
					// leave this source eligible for a delayed retry.
					recognizedSource = "";
					setTimeout(() => {
						if (token === recognitionToken && (img.currentSrc || img.src || "") === source) recognize();
					}, 1000);
					return;
				}
				recognizedSource = source;
				const currentCodeInput = document.querySelector("#code, input[name='code']");
				if (!currentCodeInput ||
					(currentCodeInput.value !== "" && currentCodeInput.dataset?.kisstjuAutoCode !== "1")) return;
				currentCodeInput.value = code;
				currentCodeInput.dispatchEvent?.(new Event("input", { bubbles: true }));
				currentCodeInput.dispatchEvent?.(new Event("change", { bubbles: true }));
				currentCodeInput.dataset.kisstjuAutoCode = "1";
				const usernameInput = document.querySelector("#un, #username, input[name='username']");
				const passwordInput = document.querySelector("#pd, #password, input[name='password']");
				const hasUsername = !!usernameInput?.value.length;
				const hasPswd = !!passwordInput?.value.length;
				if (hasUsername && hasPswd) {
					// document.getElementsByName("submit")[0].removeAttribute("disabled");
					document.getElementById("index_login_btn")?.click();
				}
			}).catch(() => {
				// OCR may fail transiently while the worker or language data loads.
				// Permit a later retry for the same image without creating a tight loop.
				if (token === recognitionToken && (img.currentSrc || img.src || "") === source) {
					processingSource = "";
					setTimeout(() => recognize(), 1000);
				}
			});
		};
		if (typeof img.addEventListener === "function") {
			img.addEventListener("load", recognize);
		} else {
			img.onload = recognize;
		}
		// document_idle may run after the image has already loaded.
		if (img.complete && img.naturalWidth > 0) recognize();
		// Some SSO responses replace the whole captcha <img> node instead of
		// changing src. Keep the handler attached to the replacement as well.
		if (!imageObserver && typeof MutationObserver === "function") {
			imageObserver = new MutationObserver(() => {
				const replacement = document.querySelector("#codeImage, img[src*='/cas/code']");
				if (replacement && replacement !== img) inject(replacement);
			});
			imageObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });
		}
	}
}

/**
 * 登录验证界面原神启动特效 精简版无效
 */
function fx_sso_genshinStart() {
	if (isLite) return;
	console.log("fx r: fx_sso_genshinStart");
	inject();
	function inject() {
		//原神启动！
		if (
			typeof genshinBGImg === "undefined" ||
			typeof genshinBGVideo === "undefined" ||
			typeof genshinBGMusic === "undefined" ||
			!(genshinBGImg && genshinBGVideo && genshinBGMusic)
		) {
			console.log("genshin资源损坏");
			return;
		}
		const bg = document.createElement("div");
		const loginMainPart = document.querySelector(".login-main-part");
		const loginBG = document.querySelector("#login-background");
		if (!document.body || !loginMainPart || !loginBG) return;
		bg.style.width = "100%";
		bg.style.height = "100%";
		bg.style.background = "#ffffff";
		bg.style.left = 0;
		bg.style.top = 0;
		bg.style.right = 0;
		bg.style.bottom = 0;
		bg.style.position = "absolute";
		bg.style.zIndex = 999;

		const img = document.createElement("img");
		img.style.left = 0;
		img.style.top = 0;
		img.style.right = 0;
		img.style.bottom = 0;
		img.style.margin = "auto";
		img.style.position = "absolute";
		img.style.zIndex = 999;
		img.style.scale = 0.7;

		img.src = genshinBGImg;
		bg.appendChild(img);

		document.body.appendChild(bg);

		setTimeout(() => {
			let bgalpha = 1;
			let interval = setInterval(() => {
				bgalpha -= 0.01;
				bg.style.opacity = bgalpha;
				if (bgalpha <= 0) {
					bg.style.display = "none";
					clearInterval(interval);
				}
			}, 10);
		}, 500);

		loginMainPart.style.opacity = 0;
		setTimeout(() => {
			let bgalpha = 0.0;
			let interval = setInterval(() => {
				bgalpha += 0.015;
				loginMainPart.style.opacity = bgalpha;
				if (bgalpha >= 1) {
					clearInterval(interval);
				}
			}, 10);
		}, 1500);

		//对原UI预处理 去除原来背景 设置透明
		const loginBackgroundImage = document.querySelector("#login-background-1");
		if (loginBackgroundImage) loginBackgroundImage.style.backgroundImage = "";
		loginBG.style.backgroundImage = "";
		loginBG.style.background = "#00000000";

		//原神背景视频
		const video = document.createElement("video");
		video.style.position = "fixed";
		video.style.top = "50%";
		video.style.left = "50%";
		video.style.minWidth = "100%";
		video.style.minHeight = "100%";
		video.style.width = "auto";
		video.style.height = "auto";
		video.style.zIndex = -100;
		video.style.transform = "translateX(-50%) translateY(-50%)";
		video.style.transition = "1s opacity";

		video.src = genshinBGVideo;
		video.autoplay = true;
		video.loop = true;
		video.muted = true; //必须静音才能自动播放
		video.playbackRate = 0.75;
		loginBG.appendChild(video);
		const videoPromise = video.play();
		if (videoPromise && typeof videoPromise.catch === "function") videoPromise.catch(() => {});

		//音乐按钮
		const music = document.createElement("audio");
		music.style.position = "fixed";
		music.style.top = 0;
		music.controls = true;
		music.src = genshinBGMusic;

		let alpha = 1.0; //音乐按钮的透明度 由于存在多个定时器 放在这做共有变量
		music.addEventListener("play", function () {
			(() => {
				let interval = setInterval(() => {
					alpha -= 0.051; //给个零头确保不会死循环
					music.style.opacity = alpha;
					if (alpha <= 0) {
						clearInterval(interval);
					}
				}, 10);
			})();

			music.addEventListener("mouseenter", function () {
				(() => {
					let interval = setInterval(() => {
						alpha += 0.053;
						music.style.opacity = alpha;
						if (alpha >= 1) {
							clearInterval(interval);
						}
					}, 10);
				})();
			});
			music.addEventListener("mouseleave", function () {
				(() => {
					let interval = setInterval(() => {
						alpha -= 0.059;
						music.style.opacity = alpha;
						if (alpha <= 0) {
							clearInterval(interval);
						}
					}, 10);
				})();
			});
		});

		document.body.appendChild(music);
	}
}

/**
 * 把海小棠换成别的机器人 精简版无效
 */
function fx_sso_setRobot(id) {
	if (isLite) return;
	console.log("fx r: fx_sso_setRobot");
	inject(id);
	function inject(id) {
		if (typeof robotList === "undefined" || !robotList || !robotList[id - 1]) {
			console.log("robot data err: ", id);
			return;
		}
		//预处理原先布局 海小棠下班
		const robotContent = document.querySelector(".robot-content");
		const haixiaotang = document.querySelector(".robot-anm-container");
		const toast = document.querySelector(".robot-mag-win");
		if (!robotContent || !haixiaotang || !toast) return;
		robotContent.style.padding = "0 0";
		robotContent.removeChild(haixiaotang);
		toast.style.bottom = "500px";
		//取图片和台词
		const { imgs, tips } = robotList[id - 1];
		const imgdata = imgs[((Math.random() * 100) >> 0) % imgs.length];
		const tipStr = tips[((Math.random() * 100) >> 0) % tips.length];
		//创建图片元素
		const robotimg = document.createElement("img");
		robotimg.src = imgdata;
		robotimg.onclick = function () {
			const tipStr = tips[((Math.random() * 100) >> 0) % tips.length];
			showInfoOn(tipStr);
		};
		robotContent.appendChild(robotimg);
		//提示词
		showInfoOn(tipStr);
	}

	function showInfoOn(info) {
		const message = document.querySelector("#robot-msg");
		const toast = document.querySelector(".robot-mag-win");
		if (!message || !toast) return;
		message.textContent = info;
		toast.setAttribute("class", "robot-mag-win big-small");
		toast.setAttribute("class", "robot-mag-win small-big-small");
	}
}

/**
 * 我不是弱密码 跳过弱密码弹窗
 */
function fx_sso_antiWeakPwd() {
	console.log("fx r: fx_classes_antiWeakPwd");
	let attempts = 0;
	let timer = setInterval(function () {
		const dialog = document.querySelector("#layui-layer1");
		const buttons = dialog ? Array.from(dialog.querySelectorAll?.(".layui-layer-btn a, .layui-layer-btn button, .layui-layer-btn input") || []) : [];
		const skipButton = buttons.find((button) => {
			const label = (button.textContent || button.value || button.getAttribute?.("aria-label") || "").trim();
			return /跳过|稍后|skip|later/i.test(label);
		}) || (buttons.length === 2 ? dialog?.querySelector(".layui-layer-btn1") : null);
		if (skipButton) {
			skipButton.click();
			clearInterval(timer);
		} else if (++attempts >= 300) {
			// The dialog is optional.  Stop after about 30 seconds when it is not
			// present (for example after a successful login).
			clearInterval(timer);
		}
	}, 100);
}

/**
 * 批改网解除粘贴限制
 */
function fx_pigai_paste() {
	console.log("fx r: fx_pigai_paste");
	let timer;
	let attempts = 0;
	let observer;
	const findEditor = () => {
		const container = document.querySelector("#contents");
		const direct = container?.matches?.("textarea, [contenteditable='true']")
			? container
			: container?.querySelector?.("textarea, [contenteditable='true']") ||
				document.querySelector("textarea[name='contents'], textarea[id*='content'], [contenteditable='true']");
		if (direct) return direct;
		// A few versions put the editor in a same-origin iframe.
		for (const frame of Array.from(document.querySelectorAll("iframe"))) {
			try {
				const frameDoc = frame.contentDocument;
				const editor = frameDoc?.querySelector("[contenteditable='true'], textarea, #contents");
				if (editor) return editor;
			} catch (e) {}
		}
		return null;
	};
	const setValue = (inputArea, text) => {
		if ("value" in inputArea) {
			const proto = Object.getPrototypeOf(inputArea);
			const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
			const value = `${inputArea.value || ""}${text}`;
			if (setter) setter.call(inputArea, value);
			else inputArea.value = value;
		} else {
			const ownerDocument = inputArea.ownerDocument || document;
			let inserted = false;
			try {
				inputArea.focus?.();
				inserted = !!ownerDocument.execCommand?.("insertText", false, text);
			} catch (e) {}
			if (!inserted) inputArea.textContent = `${inputArea.textContent || ""}${text}`;
		}
		// Elements inside a same-origin iframe belong to a different Window
		// realm. Construct events from that realm; dispatching the outer-page
		// Event can throw a TypeError in Chromium and silently skip framework
		// updates (React/Vue editors are especially sensitive to this).
		const EventCtor = inputArea.ownerDocument?.defaultView?.Event ||
			(typeof Event === "function" ? Event : null);
		if (EventCtor) {
			try {
				inputArea.dispatchEvent?.(new EventCtor("input", { bubbles: true }));
				inputArea.dispatchEvent?.(new EventCtor("change", { bubbles: true }));
			} catch (e) {}
		}
	};
	const bind = (inputArea) => {
		if (!inputArea || inputArea.dataset.kisstjuPasteBound === "1") return false;
		inputArea.dataset.kisstjuPasteBound = "1";
		inputArea.addEventListener("paste", (e) => {
			const clipdata = e.clipboardData || window.clipboardData;
			const clipStr = clipdata?.getData("text/plain") || clipdata?.getData("text") || "";
			if (!clipStr) return;
			console.log("主动粘贴", clipStr);
			e.preventDefault();
			setValue(inputArea, clipStr);
		});
		return true;
	};
	const inject = () => !!bind(findEditor());
	const bindFrame = (frame) => {
		if (!frame || frame.dataset.kisstjuPasteFrameBound === "1") return;
		frame.dataset.kisstjuPasteFrameBound = "1";
		try {
			frame.contentWindow?.addEventListener?.("load", () => inject(), { once: false });
		} catch (e) {}
	};
	document.querySelectorAll("iframe").forEach(bindFrame);
	if (!inject()) {
		timer = setInterval(() => {
			document.querySelectorAll("iframe").forEach(bindFrame);
			if (inject() || ++attempts >= 120) clearInterval(timer);
		}, 500);
	}
	if (typeof MutationObserver === "function") {
		observer = new MutationObserver(() => {
			document.querySelectorAll("iframe").forEach(bindFrame);
			inject();
		});
		observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
		setTimeout(() => observer?.disconnect(), 30 * 60 * 1000);
	}
}

/**
 * 毕设网自动关闭弹窗
 */
function fx_thesis_iReallyKnow() {
	console.log("fx r: fx_thesis_iReallyKnow");

	let attempts = 0;
	let timer = setInterval(function () {
		let dialog = document.querySelector("#layui-layer1");
		let shade = document.querySelector("#layui-layer-shade1");

		if (dialog) {
			//删除dialog和shade元素；新版页面有时不再创建shade。
			dialog.remove();
			shade?.remove();
			clearInterval(timer);
		}
		else if (++attempts >= 300) {
			clearInterval(timer);
		}

		// if (document.querySelector(".layui-layer-btn0")) {
		// 	document.querySelector(".layui-layer-btn0").click();
		// 	clearInterval(timer);
		// }
	}, 100);
}

/**
 * 毕设网自动点击登录
 */

function fx_thesis_autoLogin() {
	console.log("fx r: fx_thesis_autoLogin");

	let attempts = 0;
	let timer = setInterval(function () {
		// Do not click unrelated UI buttons (for example a password visibility
		// toggle) when the page contains more than one button.
		const passwordInput = document.querySelector("input[type='password'], input[name='password']");
		const explicit = document.querySelector("#submit, #loginBtn, #login-button, button[type='submit'], input[type='submit']");
		const candidates = Array.from(document.querySelectorAll("form button, form input[type='button']"));
		const belongsToLoginForm = (button) => !passwordInput || button.closest?.("form")?.contains?.(passwordInput);
		const explicitLogin = explicit && belongsToLoginForm(explicit) ? explicit : null;
		const loginBtn = explicitLogin || candidates.find((button) => {
			const label = button.textContent || button.value || button.getAttribute?.("aria-label") || "";
			return /登录|登陆|login|sign\s*in/i.test(label) &&
				belongsToLoginForm(button);
		});

		if (loginBtn && !loginBtn.disabled && belongsToLoginForm(loginBtn)) {
			loginBtn.click();
			clearInterval(timer);
		} else if (++attempts >= 600) {
			clearInterval(timer);
		}
	}, 100);
}
