"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBehaviorSubject = void 0;
function updateBehaviorSubject(subj, cb) {
    subj.next(cb(subj.getValue()));
}
exports.updateBehaviorSubject = updateBehaviorSubject;
//# sourceMappingURL=utils.js.map