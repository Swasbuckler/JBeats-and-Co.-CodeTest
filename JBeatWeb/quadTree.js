// The would be used QuadTree algorithm if it had made the gameplay more optimized... but since it didn't it goes here for future uses.
// Maybe if more objects were used in a spaced out manner this would be more efficient

// Quad Class
class Quad {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

// QuadTree Class
class QuadTree {
    constructor(bounds, n, level) {
        this.bounds = bounds;
        this.n = n;
        this.level = level;
        this.bodies = [];
        this.nodes = [];
    }

    split() {
        let nextLevel = this.level + 1;
        let x = this.bounds.x;
        let y = this.bounds.y;
        let width = this.bounds.width;
        let height = this.bounds.height;
        
        this.nodes[0] = new QuadTree(new Quad(x - (width / 4), y + (height / 4), width / 2, height / 2), this.n, nextLevel); // Top Left
        this.nodes[1] = new QuadTree(new Quad(x + (width / 4), y + (height / 4), width / 2, height / 2), this.n, nextLevel); // Top Right
        this.nodes[2] = new QuadTree(new Quad(x + (width / 4), y - (height / 4), width / 2, height / 2), this.n, nextLevel); // Bottom Right
        this.nodes[3] = new QuadTree(new Quad(x - (width / 4), y - (height / 4), width / 2, height / 2), this.n, nextLevel); // Bottom Left
    }

    getIdx(body) {
        let indexes = [];
        let x = this.bounds.x;
        let y = this.bounds.y;

        let aabb = body.aabb;

        let north = aabb.max.y > y;
        let south = aabb.min.y < y;
        let east = aabb.max.x > x;
        let west = aabb.min.x < x;

        if(north && west) {
            indexes.push(0);
        }
        
        if(north && east) {
            indexes.push(1);
        }

        if(south && east) {
            indexes.push(2);
        }

        if(south && west) {
            indexes.push(3);
        }
     
        return indexes;
    }

    insert(body) {

        let indexes;
         
        if(this.nodes.length) {
            indexes = this.getIdx(body);
     
            for(let i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].insert(body);     
            }

            return;
        }

        this.bodies.push(body);

        if(this.bodies.length > this.n) {

            if(!this.nodes.length) {
                this.split();
            }
            
            for(let i = 0; i < this.bodies.length; i++) {
                indexes = this.getIdx(this.bodies[i]);

                for(let j = 0; j < indexes.length; j++) {
                    this.nodes[indexes[j]].insert(this.bodies[i]);
                }
            }

            this.bodies = [];
        }
    }

    retrieve(body) {
        let indexes = this.getIdx(body)
        let bodyCandits = this.bodies;
            
        if (this.nodes.length) {
            for (let i = 0; i < indexes.length; i++) {
                bodyCandits = bodyCandits.concat(this.nodes[indexes[i]].retrieve(body));
            }
        }

        if (this.level === 0) {
            return Array.from(new Set(bodyCandits));
        }
     
        return bodyCandits;
    }

    clear() {
        this.bodies = [];
     
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes.length) {
                this.nodes[i].clear();
            }
        }

        this.nodes = [];
    }

    draw() {
        let x = this.bounds.x;
        let y = this.bounds.y;
        let width = this.bounds.width;
        let height = this.bounds.height;

        let mirror = y / ctx.canvas.height;
        mirror = (mirror - 0.5) * 2;

        ctx.beginPath();
        ctx.moveTo(x - (width / 2), (y + (height / 2)) - mirror * ctx.canvas.height);
        ctx.lineTo(x + (width / 2), (y + (height / 2)) - mirror * ctx.canvas.height);
        ctx.lineTo(x + (width / 2), (y - (height / 2)) - mirror * ctx.canvas.height);
        ctx.lineTo(x - (width / 2), (y - (height / 2)) - mirror * ctx.canvas.height);
        ctx.closePath();
        ctx.strokeStyle = 'hsl(0, 0%, 100%)';
        ctx.stroke();

        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes.length) {
                this.nodes[i].draw();
            }
        }
    }
}

// Instantiating QuadTree
let headTree = new QuadTree(new Quad(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height), 4, 0);

// Code in Other sections:
// In the Body Class
this.bodyIndex = 0;

// BroadPhase
//let aabbA = bodyA.getAABB();

let candidates = headTree.retrieve(bodyA);
        
for (let j = 0; j < candidates.length; j++) {
    let bodyB = candidates[j];
    let aabbB = bodyB.getAABB();

    if (bodyB == bodyA) {
        continue;
    }

    if (bodyA.isStatic && bodyB.isStatic) {
        continue;
    }

    if (!Collision.intersectAABB(aabbA, aabbB)) {
        continue;
    }

    contactPairs.push([i, bodyB.bodyIndex]);
}

//for (let j = i + 1; j < bodyList.length; j++) 

// Step
//for (let it = 0; it < iterations; it++) {
    headTree.clear();

// Step Bodies 
//body.step(time, gravity, iterations);
headTree.insert(body);