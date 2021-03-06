/**
 * @license
 * Copyright color-coding studio. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License, Version 2.0
 * that can be found in the LICENSE file at http://www.apache.org/licenses/LICENSE-2.0
 */

import * as ibas from "ibas/index";
import * as bo from "./bo/index";
import {
    IBORepositoryImportExport, SchemaMethodsCaller,
    BO_REPOSITORY_IMPORTEXPORT,
} from "../api/index";
import { DataConverter4ie } from "./DataConverters";

/** 数据导入&导出 业务仓库 */
export class BORepositoryImportExport extends ibas.BORepositoryApplication implements IBORepositoryImportExport {

    /** 创建此模块的后端与前端数据的转换者 */
    protected createConverter(): ibas.IDataConverter {
        return new DataConverter4ie();
    }
    /**
     * 导入
     * @param caller 调用者
     */
    import(caller: ibas.UploadFileCaller): void {
        if (!this.address.endsWith("/")) { this.address += "/"; }
        let fileRepository: ibas.FileRepositoryUploadAjax = new ibas.FileRepositoryUploadAjax();
        fileRepository.token = this.token;
        fileRepository.address = this.address.replace("/services/rest/data/", "/services/rest/file/");
        fileRepository.converter = this.createConverter();
        fileRepository.uploadFile("import", caller);
    }
    /** 创建远程仓库 */
    protected createRemoteRepository(): ibas.IRemoteRepository {
        let boRepository: ibas.BORepositoryAjax = new ibas.BORepositoryAjax();
        boRepository.address = this.address;
        boRepository.token = this.token;
        boRepository.converter = this.createConverter();
        return boRepository;
    }
    /**
     * 获取业务对象架构
     * @param caller 调用者
     */
    schema(caller: SchemaMethodsCaller<string>): void {
        let remoteRepository: ibas.IRemoteRepository = this.createRemoteRepository();
        if (ibas.objects.isNull(remoteRepository)) {
            throw new Error(ibas.i18n.prop("sys_invalid_parameter", "remoteRepository"));
        }
        let method: string =
            ibas.strings.format("schema?boCode={0}&type={1}&token={2}",
                caller.boCode, caller.type, this.token);
        remoteRepository.callRemoteMethod(method, undefined, caller);
    }
    /**
     * 查询 数据导出模板
     * @param fetcher 查询者
     */
    fetchDataExportTemplate(fetcher: ibas.FetchCaller<bo.DataExportTemplate>): void {
        super.fetch(bo.DataExportTemplate.name, fetcher);
    }
    /**
     * 保存 数据导出模板
     * @param saver 保存者
     */
    saveDataExportTemplate(saver: ibas.SaveCaller<bo.DataExportTemplate>): void {
        super.save(bo.DataExportTemplate.name, saver);
    }

}

// 注册业务对象仓库到工厂
ibas.boFactory.register(BO_REPOSITORY_IMPORTEXPORT, BORepositoryImportExport);
