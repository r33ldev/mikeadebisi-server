"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactResolver = void 0;
const type_graphql_1 = require("type-graphql");
const contact_model_1 = require("../model/contact.model");
const contact_service_1 = require("../service/contact.service");
class ContactResolver {
    constructor(contactService) {
        this.contactService = contactService;
        this.contactService = new contact_service_1.ContactService();
    }
    async getAllContacts() {
        return this.contactService.getAllContacts();
    }
    async getContactsByEmail(email) {
        return this.contactService.getAllContactsByEmail(email);
    }
    async newContact(input) {
        let contact;
        try {
            contact = await this.contactService.newContact(input);
        }
        catch (e) {
            console.error(e);
            return {
                status: 'error',
                message: 'Error saving contact',
                data: null,
                error: e.message
            };
        }
        return contact;
    }
}
__decorate([
    (0, type_graphql_1.Query)(() => [contact_model_1.Contact]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "getAllContacts", null);
__decorate([
    (0, type_graphql_1.Query)(() => contact_model_1.Contact),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "getContactsByEmail", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => contact_model_1.Contact),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_model_1.newContactInput]),
    __metadata("design:returntype", Promise)
], ContactResolver.prototype, "newContact", null);
exports.ContactResolver = ContactResolver;
//# sourceMappingURL=contact.resolver.js.map