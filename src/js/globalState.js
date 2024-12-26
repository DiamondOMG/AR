import { BehaviorSubject } from "rxjs";

// สร้าง BehaviorSubject สำหรับ global state
const throwXYZ = {
	throwX: 0,
	throwY: 0,
	throwZ: 0,
};

const throwXYZ$ = new BehaviorSubject(throwXYZ);

export default throwXYZ$;
