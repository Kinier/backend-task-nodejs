import express, { Router, Request, Response } from "express";
import { userService } from "./user.service";
import multer from 'multer';
import PDFDocument from 'pdfkit';
import { isAuthenticated } from "../../middleware/auth.middleware";

// ну а че)
declare module "express-session" {
  interface SessionData {
    user: {
      isLogged: boolean,
      email: string
    };
  }
}

// import path from "path";
const router = Router();
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './public'); // path.join(__dirname, '../../../public')
  },
  filename: (_req, _file, cb) => {
    cb(null, Date.now() + '.jpg');
  }
})

const upload = multer({ storage }).single('image');

router.route('/register').post(
  express.urlencoded(),
  async (req: Request, res: Response) => {
    const { email, firstName, lastName, password } = req.body;
    console.log(req.body);
    const user = await userService.createUser({ email, firstName, lastName, password });

    if (user) {
      req.session.user = { isLogged: true, email: email };
      res.status(201).json(user);
    } else {
      res
        .status(400)
        .json({ code: 'USER_NOT_CREATE', msg: 'User not create' });
    }
  }
);

router.route('/login').post(
  express.urlencoded(),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await userService.checkUser(email, password);

    if (user) {
      req.session.user = { isLogged: true, email: email };

      res.status(201).json(user);
    } else {
      res
        .status(404)
        .json({ code: 'USER_NOT_FOUND', msg: 'User not found' });
    }
  }
);

router.route('/logout').post(
  express.urlencoded(),
  isAuthenticated,
  async (req: Request, res: Response) => {
    req.session.user = { isLogged: false, email: "" };

    req.session.destroy((err) => {
      console.log(err)
      res.status(201).json({ status: "ok" });
    });

  }
);


router.route('/generate-document').post(
  express.urlencoded(),
  isAuthenticated,
  async (req: Request, res: Response) => {

    const { email } = req.body; // обязательно в теле email передать надо, ладно.

    console.log(req.body);

    const user = await userService.getByEmail(email);


    if (user) {
      const doc = new PDFDocument();
      let buffers: any = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {

        let pdfData = Buffer.concat(buffers);

        userService.updateDocByEmail(user?.email!, pdfData);
      });

      doc.text(user?.firstName!);
      doc.text(user?.lastName!);
      try {
        doc.image("./public/" + user?.image, {
          fit: [250, 300],
          align: 'center',
          valign: 'center'
        });
        doc.end();
      } catch (error) {
        res.json({ status: false });
        return;
      }





      res.status(201).json({ status: true });

    } else {
      res.json({ status: false });
    }



  }
);

router.route('/:id/download-document').get(
  express.urlencoded(),
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;


    const user = await userService.getById(parseInt(id!));


    if (user) {
      res.header("Content-Disposition", "attachment; filename=\"test.pdf\"")
      res.header("Content-Type", "application/pdf")
      res.send(user.pdf);
    } else {
      res
        .status(404)
        .json({ code: 'USER_NOT_FOUND', msg: 'User not found' });
    }
  }
);

router.route('/:id').get(
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await userService.getById(parseInt(id!));


    if (user) {
      await res.json(user);
    } else {
      res
        .status(404)
        .json({ code: 'USER_NOT_FOUND', msg: 'User not found' });
    }
  }
);

router.route('/').get(
  isAuthenticated,
  async (_req: Request, res: Response) => {

    const users = await userService.getAll();


    res.json(users);
  }
);



router.route('/:id').put(
  express.json(),
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const oldUser = await userService.getById(parseInt(id!))

    const user = await userService.updateById(parseInt(id!), req.body);
    // console.log(user)
    if ((user) && (user.affected) && (user.affected > 0)) {
      if ((oldUser !== null) && (oldUser.email === req.session.user?.email)) {
        req.session.user = { isLogged: true, email: req.body.email };
        console.log(req.session.user);
      }
      res.status(200).json(user);
    } else {
      res
        .status(404)
        .json({ code: 'USER_NOT_FOUND', msg: 'User not found' });
    }
  }
);

router.route('/:id/upload-image').patch(
  upload,
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const image = req.file?.filename!;

    const user = await userService.updateImageById(parseInt(id!), image);
    // console.log(user)
    if (user) {
      res.status(200).json(user);
    } else {
      res
        .status(404)
        .json({ code: 'USER_NOT_FOUND', msg: 'User not found' });
    }
  }
);

router.route('/:id').delete(
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const oldUser = await userService.getById(parseInt(id!))
    const user = await userService.deleteById(parseInt(id!));

    if (!user) {
      res
        .status(404)
        .json({ code: 'USER_NOT_FOUND', msg: 'User not found' });
    } else {
      if ((oldUser !== null) && (oldUser.email === req.session.user?.email)) {
        req.session.user = { isLogged: false, email: "" };
        req.session.destroy((err) => {
          console.log(err)
          res.status(200).json({ code: 'USER_DELETED', msg: 'Your account deleted' });
        });

      } else {
        res.status(200).json({ code: 'USER_DELETED', msg: 'The user has been deleted' });
      }
    }


  }
);

export default router;