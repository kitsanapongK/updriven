export default class User {
    constructor(id = null, firstname = null, lastname = null, avatar = null, background = null, state_id=null, province=null, organization = null) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
      this.avatar = avatar;
      this.background = background;
      this.state_id = state_id;
      this.province = province;
      this.organization = organization;
    }
}