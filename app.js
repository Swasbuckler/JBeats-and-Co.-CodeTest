//> Canvas
const bodyDoc = document.body;
bodyDoc.addEventListener('animationend', function() {
    bodyDoc.classList.remove('screen_shake');
})

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Physic Simulation Classes
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }

    sub(vec) {
        return new Vector(this.x - vec.x, this.y - vec.y);
    }

    multi(scale) {
        return new Vector(this.x * scale, this.y * scale);
    }

    divide(scale) {
        return new Vector(this.x / scale, this.y / scale);
    }

    negative() {
        return new Vector(-this.x, -this.y);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    magSq() {
        return this.x * this.x + this.y * this.y;
    }

    transform(tf) {
        return new Vector(
            tf.cos * this.x - tf.sin * this.y + tf.posX, 
            tf.sin * this.x + tf.cos * this.y + tf.posY);
    }

    equals(vec) {
        if (vec instanceof Vector) {
            return this.x === vec.x && this.y === vec.y;
        } else {
            return false;
        }
    }

    toString() {
        return `x: ${this.x}, y: ${this.y}`;
    }
}

class VectorMath {
    static smallValue = 0.0005;

    static distance(vecA, vecB) {
        let distX = vecB.x - vecA.x;
        let distY = vecB.y - vecA.y;
        return Math.sqrt(distX * distX + distY * distY);
    }

    static distanceSq(vecA, vecB) {
        let distX = vecB.x - vecA.x;
        let distY = vecB.y - vecA.y;
        return distX * distX + distY * distY;
    }

    static normalize(vec) {
        if (vec.mag() === 0) {
            return new Vector(0, 0);
        } else {
            return new Vector(vec.x / vec.mag(), vec.y / vec.mag());
        }
    }

    static dot(vecA, vecB) {
        return vecA.x * vecB.x + vecA.y * vecB.y;
    }

    static cross(vecA, vecB) {
        return vecA.x * vecB.y - vecA.y * vecB.x;
    }

    static transformRotate(tf) {
        return new Vector(
            tf.cos * tf.posX - tf.sin * tf.posY, 
            tf.sin * tf.posX + tf.cos * tf.posY);
    }

    static clamp(v, min, max) {
        if (min == max) {
            return min;
        } 
        if (min > max) {
            console.log("Min larger than Max during clamping");
        }
        if (v < min) {
            return min;
        }
        if (v > max) {
            return max;
        }

        return v;
    }

    static nearlyEqualsVal(a, b) {
        return Math.abs(a - b) < VectorMath.smallValue;
    }

    static nearlyEqualsVec(vecA, vecB) {
        return VectorMath.distanceSq(vecA, vecB) < (VectorMath.smallValue * VectorMath.smallValue);
    }

    static lerp(a, b, n) {
        return (b - a) * n + a;
    }
}

class Body {
    constructor(density, area, mass, inertia, restitution, isStatic, radius, width, height, vertices, shapeType, colour, outlineColour, isTrigger) {
        this.pos = new Vector(0, 0);
        this.linearVel = new Vector(0, 0);
        this.angle = 0;
        this.angularVel = 0;
        this.force = new Vector(0, 0);

        this.density = density;
        this.area = area;
        this.mass = mass;
        this.inverseMass = mass > 0 ? (1 / mass) : 0;
        this.inertia = inertia;
        this.inverseInertia = inertia > 0 ? (1 / inertia) : 0;
        this.restitution = restitution;

        this.radius = radius;
        this.width = width;
        this.height = height;
        this.staticFriction = 0.6;
        this.dynamicFriction = 0.4;
        
        this.isStatic = isStatic;

        this.moving = false;
        this.moveValue = 0;
        this.oldPos = null;
        this.nextPos = null;

        this.isTrigger = isTrigger;
        this.collided = false;
        this.collisionTarget = null;
        this.collidedWithTarget = false;

        this.isBreakaway = false;
        this.breakNum = 0;
        this.breakaways = [];
        this.breakAmount = 0;

        this.isDrawable = true;
        this.isGravityAffect = true;
        this.isPlayer = false;

        this.shapeType = shapeType;
        this.colour = colour;
        this.collisionColour = false;
        this.outlineColourValue = 0;
        this.outlineColour = outlineColour || colour;
        this.sprite = null;

        if (this.shapeType === shapeList['Box']) {
            this.vertices = vertices;
            this.transformedVertices = [];
        } else {
            this.vertices = null;
            this.transformedVertices = null;
        }

        this.aabb = null;

        this.transformUpdateRequired = true;
        this.aabbUpdateRequired = true;
    }

    static createBoxVertices(width, height) {
        let left = -width / 2;
        let right = left + width;
        let bottom = -height / 2;
        let top = bottom + height;

        let vertices = [];
        vertices.push(new Vector(left, top));
        vertices.push(new Vector(right, top));
        vertices.push(new Vector(right, bottom));
        vertices.push(new Vector(left, bottom));
        return vertices;
    }

    getTransformedVertices() {
        if (this.transformUpdateRequired) {
            let transform = new Transform(this.pos, this.angle);

            for (let i = 0; i < this.vertices.length; i++) {
                this.transformedVertices[i] = this.vertices[i].transform(transform);
            }
        }

        this.transformUpdateRequired = false;
        return this.transformedVertices;
    }

    getAABB() {
        if (this.aabbUpdateRequired) {
            let minX = Number.MAX_VALUE;
            let minY = Number.MAX_VALUE;
            let maxX = Number.MIN_VALUE;
            let maxY = Number.MIN_VALUE;

            if (this.shapeType === shapeList['Circle']) {
                minX = this.pos.x - this.radius;
                minY = this.pos.y - this.radius;
                maxX = this.pos.x + this.radius;
                maxY = this.pos.y + this.radius;

            } else if (this.shapeType === shapeList['Box']) {
                let vertices = this.getTransformedVertices();

                for (let i = 0; i < vertices.length; i++) {
                    let v = vertices[i];

                    if (v.x < minX) { minX = v.x };
                    if (v.y < minY) { minY = v.y };
                    if (v.x > maxX) { maxX = v.x };
                    if (v.y > maxY) { maxY = v.y };
                }

            } else {
                console.log("Not valid Shape");
            }

            this.aabb = new AABB(new Vector(minX, minY), new Vector(maxX, maxY));
        }

        this.aabbUpdateRequired = false;
        return this.aabb;
    }

    step(time, gravity, iterations) {
        if (this.isStatic) {
            return;
        }

        time /= iterations;

        let acc = this.force.divide(this.mass);
        this.linearVel = this.linearVel.add(acc.multi(time));

        if (this.isGravityAffect) {
            this.linearVel = this.linearVel.add(gravity.multi(time));
        }

        this.pos = this.pos.add(this.linearVel.multi(time));

        this.angle += this.angularVel * time;
        
        this.force = new Vector(0, 0);
        this.transformUpdateRequired = true;
        this.aabbUpdateRequired = true;
    }

    setSize(radius, width, height) {
        if (this.shapeType === shapeList['Circle']) {
            this.radius = radius;
        } else if (this.shapeType === shapeList['Box']) {
            this.width = width;
            this.height = height;
        } else {
            console.log("Not valid Shape");
        }
        this.transformUpdateRequired = true;
        this.aabbUpdateRequired = true;
    }

    shatter(bodyList) {
        let exampleBreakaway = this.breakaways[0];

        let longerSide = Math.max(this.width, this.height);
        let firstPos, towardsPos;
        let transform = new Transform(new Vector(1, 0), this.angle);
        let rotatedVec = VectorMath.transformRotate(transform);
        if (longerSide == this.width) {
            firstPos = this.pos.add(rotatedVec.multi((longerSide / 2) - (exampleBreakaway.width / 2)));
            towardsPos = VectorMath.normalize(this.pos.sub(firstPos)).multi(exampleBreakaway.width);
        } else {
            rotatedVec = new Vector(-rotatedVec.y, rotatedVec.x);
            firstPos = this.pos.add(rotatedVec.multi((longerSide / 2) - (exampleBreakaway.height / 2)));
            towardsPos = VectorMath.normalize(this.pos.sub(firstPos)).multi(exampleBreakaway.height);
        }

        for (let i = 0; i < this.breakNum; i++) {
            let breakaway = this.breakaways[i];
            breakaway.moveTo(firstPos.add(towardsPos.multi(i)));
            breakaway.rotate(this.angle);
        }

        let bodyIdx = bodyList.indexOf(this);
        bodyList.splice(bodyIdx, 1, ...this.breakaways);
        this.isBreakaway = false;
    }
    
    createBreakaways(breakNum, breakAmount, gravity) {
        this.isBreakaway = true;
        let breakaways = [];

        let longerSide = Math.max(this.width, this.height);
        let shorterSide = Math.min(this.width, this.height);
        let breakLength = longerSide / breakNum;

        for (let i = 0; i < breakNum; i++) {
            let breakaway;
            if (longerSide == this.width) {
                breakaway = Body.createBox(breakLength, shorterSide, this.density, this.restitution, false, this.colour, this.outlineColour, false);
            } else {
                breakaway = Body.createBox(shorterSide, breakLength, this.density, this.restitution, false, this.colour, this.outlineColour, false);
            }
            breakaway.isGravityAffect = gravity;
            breakaways.push(breakaway);
        }
        
        this.breakNum = breakNum;
        this.breakaways = breakaways;
        this.breakAmount = breakAmount; 
    }

    move(amount) {
        this.pos = this.pos.add(amount);
        this.transformUpdateRequired = true;
        this.aabbUpdateRequired = true;
    }

    moveTo(pos, moveValue, time) {
        if (moveValue) {
            if (!this.moving) {
                this.moveValue = moveValue;
                this.oldPos = this.pos;
                this.nextPos = pos;
                this.moving = true;
            }
            let dif = Math.max(0, Math.min(1, (moveValue - this.moveValue) * (0.0005 / time)));
            this.pos = new Vector(VectorMath.lerp(this.oldPos.x, this.nextPos.x, dif), VectorMath.lerp(this.oldPos.y, this.nextPos.y, dif));
            this.transformUpdateRequired = true;
            this.aabbUpdateRequired = true;
            if (dif == 1) {
                this.moving = false;
            }
        } else {
            this.pos = pos;
            this.transformUpdateRequired = true;
            this.aabbUpdateRequired = true;
        }
    }

    rotate(amount) {
        this.angle += amount;
        this.transformUpdateRequired = true;
        this.aabbUpdateRequired = true;
    }

    rotateTo(angle, moveValue) {
        this.angle = angle;
        this.transformUpdateRequired = true;
        this.aabbUpdateRequired = true;
    }

    addForce(amount) {
        this.force = amount;
    }

    static createCircle(radius, density, restitution, isStatic, colour, outlineColour) {
        let area = Math.PI * radius * radius;
        restitution = VectorMath.clamp(restitution, 0, 1);
        let mass = 0;
        let inertia = 0;

        if (!isStatic) {
            mass = area * density;
            inertia = (1 / 2) * mass * radius * radius;
        }

        return new Body(density, area, mass, inertia, restitution, isStatic, radius, 0, 0, null, shapeList['Circle'], colour, outlineColour, null);
    }

    static createBox(width, height, density, restitution, isStatic, colour, outlineColour, isTrigger) {
        let area = width * height;
        restitution = VectorMath.clamp(restitution, 0, 1);
        let mass = 0;
        let inertia = 0;

        if (!isStatic) {
            mass = area * density;
            inertia = (1 / 12) * mass * (width * width + height * height);
        }

        let vertices = Body.createBoxVertices(width, height);

        return new Body(density, area, mass, inertia, restitution, isStatic, 0, width, height, vertices, shapeList['Box'], colour, outlineColour, isTrigger);
    }

    drawBody() {
        let mirror = this.pos.y / ctx.canvas.height;
        mirror = (mirror - 0.5) * 2;

        if (this.shapeType === shapeList['Circle']) {
            let posY = this.pos.y - mirror * ctx.canvas.height;

            let va = new Vector(0, 0);
            let vb = new Vector(this.radius, 0);
            let transform = new Transform(this.pos, -this.angle);
            va = va.transform(transform);
            vb = vb.transform(transform);

            if (this.sprite !== null) {
                this.colour = "hsl(50, 50%, 50%)";
                let angleVec = VectorMath.normalize(vb.sub(va));
                let angleStart = new Vector(1, 0);
                let angleDraw = Math.atan2(angleVec.y * angleStart.x - angleVec.x * angleStart.y, angleVec.x * angleStart.x + angleVec.y * angleStart.y);
    
                ctx.save();
                ctx.translate(this.pos.x, posY);
                ctx.rotate(angleDraw);
                ctx.drawImage(this.sprite, -this.sprite.width * 0.31, -this.sprite.height * 0.3, this.sprite.width * 0.61, this.sprite.height * 0.61);
                ctx.restore();
            } else {
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y - mirror * ctx.canvas.height, this.radius, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.strokeStyle = this.outlineColour;
                ctx.stroke();
                ctx.fillStyle = this.colour;
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(va.x, va.y - mirror * ctx.canvas.height);
                ctx.lineTo(vb.x, vb.y - mirror * ctx.canvas.height);
                ctx.closePath();
                ctx.strokeStyle = "black";
                ctx.stroke();
            }
            
        } else if (this.shapeType === shapeList['Box']) {
            let vertexBuffer = this.getTransformedVertices();
            
            ctx.beginPath();
            ctx.moveTo(vertexBuffer[0].x - 2 * (vertexBuffer[0].x - this.pos.x), vertexBuffer[0].y - mirror * ctx.canvas.height);
            ctx.lineTo(vertexBuffer[1].x - 2 * (vertexBuffer[1].x - this.pos.x), vertexBuffer[1].y - mirror * ctx.canvas.height);
            ctx.lineTo(vertexBuffer[2].x - 2 * (vertexBuffer[2].x - this.pos.x), vertexBuffer[2].y - mirror * ctx.canvas.height);
            ctx.lineTo(vertexBuffer[3].x - 2 * (vertexBuffer[3].x - this.pos.x), vertexBuffer[3].y - mirror * ctx.canvas.height);
            ctx.closePath();
            ctx.strokeStyle = this.outlineColour;
            ctx.stroke();
            ctx.fillStyle = this.colour;
            ctx.fill();
        } else {
            console.log("Not valid Shape");
        }
    }
}

class Transform {
    constructor(pos, angle) {
        this.posX = pos.x;
        this.posY = pos.y;
        this.sin = Math.sin(angle);
        this.cos = Math.cos(angle);
    }
}

class Collision {
    static intersectCirclePolygon(centerC, radiusC, centerP, verticesP) {
        let normal = new Vector(0, 0);
        let depth = Number.MAX_VALUE;
        let axis = new Vector(0, 0);
        let axisDepth = 0;
        let minA, maxA, minB, maxB;

        for (let i = 0; i < verticesP.length; i++) {
            let va = verticesP[i];
            let vb = verticesP[(i + 1) % verticesP.length];
            let edge = vb.sub(va);
            axis = VectorMath.normalize(new Vector(-edge.y, edge.x));

            [minA, maxA] = Collision.projectVertices(verticesP, axis);
            [minB, maxB] = Collision.projectCircle(centerC, radiusC, axis);

            if (minA >= maxB || minB >= maxA) {
                return [false, null, null];
            }

            axisDepth = Math.min(maxB - minA, maxA - minB);
            if (axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        let cpIndex = Collision.findClosestOnPolygon(centerC, verticesP);
        let cp = verticesP[cpIndex];

        axis = VectorMath.normalize(cp.sub(centerC));

        [minA, maxA] = Collision.projectVertices(verticesP, axis);
        [minB, maxB] = Collision.projectCircle(centerC, radiusC, axis);

        if (minA >= maxB || minB >= maxA) {
            return [false, null, null];
        }

        axisDepth = Math.min(maxB - minA, maxA - minB);
        if (axisDepth < depth) {
            depth = axisDepth;
            normal = axis;
        }

        let dir = centerP.sub(centerC);

        if (VectorMath.dot(dir, normal) < 0) {
            normal = normal.negative();
        }

        return [true, normal, depth];
    }

    static intersectCircles(centerA, radiusA, centerB, radiusB) {
        let dist = VectorMath.distance(centerA, centerB);
        let radiusTotal = radiusA + radiusB;
        let normal = new Vector(0, 0);
        let depth = 0;

        if (dist >= radiusTotal) {
            return [false, null, null];
        } 

        normal = VectorMath.normalize(centerB.sub(centerA));
        depth = radiusTotal - dist;
        
        return [true, normal, depth];
    }

    static intersectPolygons(centerA, centerB, verticesA, verticesB) {
        let normal = new Vector(0, 0);
        let depth = Number.MAX_VALUE;

        for (let i = 0; i < verticesA.length; i++) {
            let va = verticesA[i];
            let vb = verticesA[(i + 1) % verticesA.length];
            let edge = vb.sub(va);
            let axis = VectorMath.normalize(new Vector(-edge.y, edge.x));

            let [minA, maxA] = Collision.projectVertices(verticesA, axis);
            let [minB, maxB] = Collision.projectVertices(verticesB, axis);
            if (minA >= maxB || minB >= maxA) {
                return [false, null, null];
            }

            let axisDepth = Math.min(maxB - minA, maxA - minB);
            if (axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        for (let i = 0; i < verticesB.length; i++) {
            let va = verticesB[i];
            let vb = verticesB[(i + 1) % verticesB.length];
            let edge = vb.sub(va);
            let axis = VectorMath.normalize(new Vector(-edge.y, edge.x));

            let [minA, maxA] = Collision.projectVertices(verticesA, axis);
            let [minB, maxB] = Collision.projectVertices(verticesB, axis);
            if (minA >= maxB || minB >= maxA) {
                return [false, null, null];
            }

            let axisDepth = Math.min(maxB - minA, maxA - minB);
            if (axisDepth < depth) {
                depth = axisDepth;
                normal = axis;
            }
        }

        let dir = centerB.sub(centerA);

        if (VectorMath.dot(dir, normal) < 0) {
            normal = normal.negative();
        }

        return [true, normal, depth];
    }

    static projectCircle(center, radius, axis) {
        let dir = VectorMath.normalize(axis);
        let dirRadius = dir.multi(radius);

        let p1 = center.add(dirRadius);
        let p2 = center.sub(dirRadius);

        let min = VectorMath.dot(p1, axis);
        let max = VectorMath.dot(p2, axis);

        if (min > max) {
            let t = min;
            min = max;
            max = t;
        }

        return [min, max];
    }

    static projectVertices(vertices, axis) {
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;

        for (let i = 0; i < vertices.length; i++) {
            let project = VectorMath.dot(vertices[i], axis);

            if (project < min) { min = project; }
            if (project > max) { max = project; }
        }

        return [min, max];
    }

    static findClosestOnPolygon(centerC, verticesP) {
        let result = -1;
        let minDist = Number.MAX_VALUE;

        for (let i = 0; i < verticesP.length; i++) {
            let dist = VectorMath.distance(verticesP[i], centerC);
            if (dist < minDist) {
                minDist = dist;
                result = i;
            }
        }

        return result;
    }

    static pointSegmentDist(centerC, pointA, pointB) {
        let cp = new Vector(0, 0);
        let ab = pointB.sub(pointA);
        let ac = centerC.sub(pointA);

        let project = VectorMath.dot(ac, ab);
        let abLengthSq = ab.magSq();
        let dist = project / abLengthSq;

        if (dist <= 0) {
            cp = pointA;
        } else if (dist >= 1) {
            cp = pointB;
        } else {
            cp = pointA.add(ab.multi(dist));
        }

        let distSq = VectorMath.distanceSq(centerC, cp);

        return [distSq, cp];
    }

    static findCPCirclePolygon(centerC, radiusC, centerP, verticesP) {
        let cp = new Vector(0, 0);
        let minDistSq = Number.MAX_VALUE;

        for (let i = 0; i < verticesP.length; i++) {
            let va = verticesP[i];
            let vb = verticesP[(i + 1) % verticesP.length];

            let [distSq, contact] = Collision.pointSegmentDist(centerC, va, vb);

            if (distSq < minDistSq) {
                minDistSq = distSq;
                cp = contact;
            }
        }

        return cp;
    }

    static findCPCircles(centerA, radiusA, centerB) {
        let ab = centerB.sub(centerA);
        let dir = VectorMath.normalize(ab);
        return centerA.add(dir.multi(radiusA));
    }

    static findCPPolygons(verticesA, verticesB) {
        let contact1 = new Vector(0, 0);
        let contact2 = new Vector(0, 0);
        let contactC = 0;

        let minDistSq = Number.MAX_VALUE;

        for (let i = 0; i < verticesA.length; i++) {
            let point = verticesA[i];

            for (let j = 0; j < verticesB.length; j++) {
                let va = verticesB[j];
                let vb = verticesB[(j + 1) % verticesB.length];

                let [distSq, cp] = Collision.pointSegmentDist(point, va, vb);

                if (VectorMath.nearlyEqualsVal(distSq, minDistSq)) {
                    if (!VectorMath.nearlyEqualsVec(cp, contact1)) {
                        contact2 = cp;
                        contactC = 2;
                    }
                } else if (distSq < minDistSq) {
                    minDistSq = distSq;
                    contact1 = cp;
                    contactC = 1;
                }
            }
        }

        for (let i = 0; i < verticesB.length; i++) {
            let point = verticesB[i];

            for (let j = 0; j < verticesA.length; j++) {
                let va = verticesA[j];
                let vb = verticesA[(j + 1) % verticesA.length];

                let [distSq, cp] = Collision.pointSegmentDist(point, va, vb);

                if (VectorMath.nearlyEqualsVal(distSq, minDistSq)) {
                    if (!VectorMath.nearlyEqualsVec(cp, contact1)) {
                        contact2 = cp;
                        contactC = 2;
                    }
                } else if (distSq < minDistSq) {
                    minDistSq = distSq;
                    contact1 = cp;
                    contactC = 1;
                }
            }
        }

        return [contact1, contact2, contactC];
    }

    static findContactPoints(bodyA, bodyB) {
        let contact1 = new Vector(0, 0);
        let contact2 = new Vector(0, 0);
        let contactC = 0;

        let sTypeA = bodyA.shapeType;
        let sTypeB = bodyB.shapeType;
    
        if (sTypeA === shapeList['Circle']) {
            if (sTypeB === shapeList['Circle']) {
                contact1 = Collision.findCPCircles(bodyA.pos, bodyA.radius, bodyB.pos);
                contactC = 1;
            } else if (sTypeB === shapeList['Box']) {
                contact1 = Collision.findCPCirclePolygon(bodyA.pos, bodyA.radius, bodyB.pos, bodyB.getTransformedVertices());
                contactC = 1;
            }
        } else if (sTypeA === shapeList['Box']) {
            if (sTypeB === shapeList['Circle']) {
                contact1 = Collision.findCPCirclePolygon(bodyB.pos, bodyB.radius, bodyA.pos, bodyA.getTransformedVertices());
                contactC = 1;
            } else if (sTypeB === shapeList['Box']) {
                [contact1, contact2, contactC] = Collision.findCPPolygons(bodyA.getTransformedVertices(), bodyB.getTransformedVertices());
            }
        }

        return [contact1, contact2, contactC];
    }

    static intersectAABB(a, b) {
        if (a.max.x <= b.min.x || b.max.x <= a.min.x || a.max.y <= b.min.y || b.max.y <= a.min.y) {
            return false;
        }

        return true;
    }

    static collide(bodyA, bodyB) {
        let collision = false;
        let normal = new Vector(0, 0);
        let depth = 0;
    
        let sTypeA = bodyA.shapeType;
        let sTypeB = bodyB.shapeType;
    
        if (sTypeA === shapeList['Circle']) {
            if (sTypeB === shapeList['Circle']) {
                [collision, normal, depth] = Collision.intersectCircles(bodyA.pos, bodyA.radius, bodyB.pos, bodyB.radius);
            } else if (sTypeB === shapeList['Box']) {
                [collision, normal, depth] = Collision.intersectCirclePolygon(bodyA.pos, bodyA.radius, bodyB.pos, bodyB.getTransformedVertices());
            }
        } else if (sTypeA === shapeList['Box']) {
            if (sTypeB === shapeList['Circle']) {
                [collision, normal, depth] = Collision.intersectCirclePolygon(bodyB.pos, bodyB.radius, bodyA.pos, bodyA.getTransformedVertices());
                if (normal != null) { normal = normal.negative(); }
            } else if (sTypeB === shapeList['Box']) {
                [collision, normal, depth] = Collision.intersectPolygons(bodyA.pos, bodyB.pos, bodyA.getTransformedVertices(), bodyB.getTransformedVertices());
            }
        }
    
        return [collision, normal, depth];
    }

    static collisionResolutionF(contact) {
        let bodyA = contact.bodyA;
        let bodyB = contact.bodyB;
        let normal = contact.normal;
        let depth = contact.depth;
        let contact1 = contact.contact1;
        let contact2 = contact.contact2;
        let contactC = contact.contactC;
    
        let e = Math.min(bodyA.restitution, bodyB.restitution);

        let sf = (bodyA.staticFriction + bodyB.staticFriction) * 0.5;
        let df = (bodyA.dynamicFriction + bodyB.dynamicFriction) * 0.5;

        contactL[0] = contact1;
        contactL[1] = contact2;

        for(let i = 0; i < contactC; i++)
        {
            impulseL[i] = new Vector(0, 0);
            raL[i] = new Vector(0, 0);
            rbL[i] = new Vector(0, 0);
            frictionImpulseL[i] = new Vector(0, 0);
            jL[i] = 0;
        }

        for (let i = 0; i < contactC; i++) {
            let ra = contactL[i].sub(bodyA.pos);
            let rb = contactL[i].sub(bodyB.pos);

            raL[i] = ra;
            rbL[i] = rb;

            let raPerp = new Vector(-ra.y, ra.x);
            let rbPerp = new Vector(-rb.y, rb.x);

            let angularLinearVelA = raPerp.multi(bodyA.angularVel);
            let angularLinearVelB = rbPerp.multi(bodyB.angularVel);

            let velA = bodyA.linearVel.add(angularLinearVelA);
            let velB = bodyB.linearVel.add(angularLinearVelB);
            let relativeVel = velB.sub(velA);

            let contactVelMag = VectorMath.dot(relativeVel, normal);
            if (contactVelMag > 0) {
                continue;
            }

            let raPerpDotN = VectorMath.dot(raPerp, normal);
            let rbPerpDotN = VectorMath.dot(rbPerp, normal);

            let denominator = bodyA.inverseMass + bodyB.inverseMass + ((raPerpDotN * raPerpDotN) * bodyA.inverseInertia) + ((rbPerpDotN * rbPerpDotN) * bodyB.inverseInertia);

            let j = -(1 + e) * VectorMath.dot(relativeVel, normal);
            j /= denominator;
            j /= contactC;

            jL[i] = j;

            let impulse = normal.multi(j);
            impulseL[i] = impulse;
        }

        for (let i = 0; i < contactC; i++) {
            let impulse = impulseL[i];
            let ra = raL[i];
            let rb = rbL[i];

            bodyA.linearVel = bodyA.linearVel.sub(impulse.multi(bodyA.inverseMass));
            bodyA.angularVel = bodyA.angularVel - (VectorMath.cross(ra, impulse) * bodyA.inverseInertia);
            bodyB.linearVel = bodyB.linearVel.add(impulse.multi(bodyB.inverseMass));
            bodyB.angularVel = bodyB.angularVel + (VectorMath.cross(rb, impulse) * bodyB.inverseInertia);
        }

        for (let i = 0; i < contactC; i++) {
            let ra = contactL[i].sub(bodyA.pos);
            let rb = contactL[i].sub(bodyB.pos);

            raL[i] = ra;
            rbL[i] = rb;

            let raPerp = new Vector(-ra.y, ra.x);
            let rbPerp = new Vector(-rb.y, rb.x);

            let angularLinearVelA = raPerp.multi(bodyA.angularVel);
            let angularLinearVelB = rbPerp.multi(bodyB.angularVel);

            let velA = bodyA.linearVel.add(angularLinearVelA);
            let velB = bodyB.linearVel.add(angularLinearVelB);
            let relativeVel = velB.sub(velA);

            let tangent = relativeVel.sub(normal.multi(VectorMath.dot(relativeVel, normal)));
            if (VectorMath.nearlyEqualsVec(tangent, new Vector(0, 0))) {
                continue;
            } else {
                tangent = VectorMath.normalize(tangent);
            }

            let raPerpDotT = VectorMath.dot(raPerp, tangent);
            let rbPerpDotT = VectorMath.dot(rbPerp, tangent);

            let denominator = bodyA.inverseMass + bodyB.inverseMass + ((raPerpDotT * raPerpDotT) * bodyA.inverseInertia) + ((rbPerpDotT * rbPerpDotT) * bodyB.inverseInertia);

            let jT = -(VectorMath.dot(relativeVel, tangent));
            jT /= denominator;
            jT /= contactC;

            let frictionImpulse = 0;
            let j = jL[i];

            if (Math.abs(jT) <= (j * sf)) {
                frictionImpulse = tangent.multi(jT);
            } else {
                frictionImpulse = tangent.multi(-j * df);
            }

            frictionImpulseL[i] = frictionImpulse;
        }

        for (let i = 0; i < contactC; i++) {
            let frictionImpulse = frictionImpulseL[i];
            let ra = raL[i];
            let rb = rbL[i];

            bodyA.linearVel = bodyA.linearVel.sub(frictionImpulse.multi(bodyA.inverseMass));
            bodyA.angularVel = bodyA.angularVel - (VectorMath.cross(ra, frictionImpulse) * bodyA.inverseInertia);
            bodyB.linearVel = bodyB.linearVel.add(frictionImpulse.multi(bodyB.inverseMass));
            bodyB.angularVel = bodyB.angularVel + (VectorMath.cross(rb, frictionImpulse) * bodyB.inverseInertia);
        }
    }
}

class AABB {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
}

class Manifold {
    constructor(bodyA, bodyB, normal, depth, contact1, contact2, contactC) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.normal = normal;
        this.depth = depth;
        this.contact1 = contact1;
        this.contact2 = contact2;
        this.contactC = contactC;
    }
}

class Level {
    constructor(height) {
        this.height = height;
        this.bodyList = [];
    }

    add(body) {
        this.bodyList.push(body);
    }

    generate(previousY) {
        for (let i = 0; i < this.bodyList.length; i++) {
            let body = this.bodyList[i];
            body.moveTo(new Vector(body.pos.x, body.pos.y + previousY));
        }
    }
}

function stepBodies(time, iterations, colourShift) {
    for (let i = 0; i < bodyList.length; i++) {
        let body = bodyList[i];
        body.collided = false;
        body.collidedWithTarget = false;

        if (body.isBreakaway) {
            breakawayList.push(body);
        }

        if (body.collisionColour) {
            body.outlineColour = `hsl(0, 0%, ${VectorMath.lerp(100, 0, Math.max(0, Math.min(1, (colourShift - body.outlineColourValue) * 0.002)))}%)`;
        }

        body.step(time, gravity, iterations);
    }
}

function seperateBodies(bodyA, bodyB, mtv) {
    if (bodyA.isStatic) {
        bodyB.move(mtv);
    } else if (bodyB.isStatic) {
        bodyA.move(mtv.negative());
    } else {
        bodyA.move(mtv.divide(2).negative());
        bodyB.move(mtv.divide(2));
    }
}

function broadPhase() {
    for (let i = 0; i < bodyList.length - 1; i++) {
        let bodyA = bodyList[i];
        let aabbA = bodyA.getAABB();

        for (let j = i + 1; j < bodyList.length; j++) {
            let bodyB = bodyList[j];
            let aabbB = bodyB.getAABB();

            if (bodyA.isStatic && bodyB.isStatic) {
                continue;
            }

            if (!Collision.intersectAABB(aabbA, aabbB)) {
                continue;
            }

            contactPairs.push([bodyA, bodyB]);
        }
    }
}

function narrowPhase(colourShift) {
    for (let i = 0; i < contactPairs.length; i++) {
        let pair = contactPairs[i];
        let bodyA = pair[0];
        let bodyB = pair[1];

        let [collision, normal, depth] = Collision.collide(bodyA, bodyB);
        if (collision) {
            if (bodyA.collisionColour) {
                bodyA.outlineColourValue = colourShift;
                bodyA.outlineColour = "hsl(0, 0%, 100%)";
            } 
            if (bodyB.collisionColour) {
                bodyB.outlineColourValue = colourShift;
                bodyB.outlineColour = "hsl(0, 0%, 100%)";
            }

            bodyA.collided = bodyA.isTrigger;
            bodyB.collided = bodyB.isTrigger;

            bodyA.collidedWithTarget = bodyA.collisionTarget === bodyB.colour;
            bodyB.collidedWithTarget = bodyB.collisionTarget === bodyA.colour;

            seperateBodies(bodyA, bodyB, normal.multi(depth));

            let [contact1, contact2, contactC] = Collision.findContactPoints(bodyA, bodyB);
            let contact = new Manifold(bodyA, bodyB, normal, depth, contact1, contact2, contactC);
            Collision.collisionResolutionF(contact);
        }
    }
}

function step(time, iterations, colourShift) {
    for (let it = 0; it < iterations; it++) {
        breakawayList = [];
        contactPairs = [];
        stepBodies(time, iterations, colourShift);

        for (let i = 0; i < breakawayList.length; i++) {
            let breakaway = breakawayList[i];
            if (!Collision.intersectAABB(jbeats.getAABB(), breakaway.getAABB())) {
                continue;
            }
    
            let [collision, normal, depth] = Collision.collide(jbeats, breakaway);
            if (!collision) {
                continue;
            }
    
            if (jbeats.linearVel.mag() >= breakaway.breakAmount) {
                breakaway.shatter(bodyList);
                bodyDoc.classList.add('screen_shake');
            }
        }

        broadPhase();
        narrowPhase(colourShift);
    }
}

// User Controls
function mouseMoveControls(e) {
    let mirrorX = e.clientX - ((window.innerWidth - ctx.canvas.width) / 2);

    let mirrorY = e.clientY / ctx.canvas.height;
    mirrorY = (mirrorY - 0.5) * 2;

    mousePos = new Vector(mirrorX, (e.clientY - window.scrollY) - mirrorY * ctx.canvas.height);
}