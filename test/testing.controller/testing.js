const BaseController = require('../../utils/baseController');

class TestingController extends BaseController {
  constructor() {
    super();
  }

  async testing(req, res) {
    try {
      super.success(res, 'Happy it is working with CI/CD Pipeline');
    } catch (e) {
      super.error(res, e);
    }
  }
}
module.exports = TestingController;
