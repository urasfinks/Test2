package ru.jamsys.servlet;

import ru.jamsys.RequestContext;

import javax.imageio.ImageIO;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@WebServlet(name = "AvatarGet", value = "/avatar-get")
public class AvatarGet extends AbstractHttpServletReader {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RequestContext rc = new RequestContext();

        if(!isAuth(request, response, rc)){
            return;
        }

        BufferedImage image = null;
        File file = new File("/var/www/jamsys/avatarImg/" + personKey + ".jpg");
        if (file.exists() && !file.isDirectory()) {
            image = ImageIO.read(file);
        }
        if(image == null){
            image = ImageIO.read(new File("/var/www/jamsys/avatarImg/no-avatar.jpg"));
        }
        ImageIO.write(image, "JPG", response.getOutputStream());
    }
}
